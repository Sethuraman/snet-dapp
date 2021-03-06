import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Eth from 'ethjs';
import { AGI,ERROR_UTILS } from '../util';
import App from "../App.js";
import Tooltip from '@material-ui/core/Tooltip';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import BlockchainHelper from "./BlockchainHelper.js"


const TabContainer = (props) => {
  return (
    <Typography component="div" style={{padding:"21px"}}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const ModalStylesAlertWait = {
  position: 'absolute',
  borderRadius: 3,
  border: 5,
  backgroundColor: 'white',
  fontSize: "13px",
  color: 'black',
  lineHeight: 40,
  height: 100,
  width: 750,
  padding: '0 10px',
  boxShadow: '0 3px 5px 2px gray',
  top: 150,
  left: 350,

}

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

export class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
    }
    this.styleheader = {

      fontSize: "15px",
      overflow: "auto",
      fontWeight: "bold",
      borderRadius: "5px",
      padding: "0px 120px 0px",
      marginTop: "30px",
    };
    this.stylerows = {

      fontSize: "15px",
      overflow: "auto",
      fontWeight: "Regular",
      borderRadius: "5px",
      padding: "0px 120px 0px",
      marginTop: "30px",
    };

    this.network = new BlockchainHelper();
    this.state = {
      ethBalance: 0,
      amount: 0,
      tokenbalance: 0,
      escrowaccountbalance: 0,
      allowedtokenbalance:[],
      value: 0,
      authorizeamount: 0,
      depositamount: 0,
      withdrawalamount: 0,
      userprofile: [],
      user_address: '',
      account: '',
      depositwarning: '',
      extamount: 0,
      extexp: 0,
      openchaining: false,
      jobStep: 0,
      chainId: undefined,
      approveerror:'',
      depositerror:'',
      withdrawalerror:'',
      depositextenderror:'',
      
    }
    //this.eth = undefined;
    this.web3Initialized = false;
    this.account = undefined;
    this.watchWalletTimer = undefined;
    this.watchNetworkTimer = undefined;

    this.handleAuthorize = this.handleAuthorize.bind(this)
    this.handleDeposit = this.handleDeposit.bind(this)
    this.handlewithdraw = this.handlewithdraw.bind(this)
    this.changeAuthorizeAmount = this.changeAuthorizeAmount.bind(this)
    this.changeDepositAmount = this.changeDepositAmount.bind(this)
    this.changeWithDrawalAmount = this.changeWithDrawalAmount.bind(this)
    this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this)
    this.handlerextendadd = this.handlerextendadd.bind(this)
    this.Expirationchange = this.Expirationchange.bind(this)
    this.extamountchange = this.extamountchange.bind(this)
    this.onOpenchaining = this.onOpenchaining.bind(this)
    this.onClosechaining = this.onClosechaining.bind(this)
  }

  onClosechaining() {
    this.setState({ openchaining: false })
  }
  onOpenchaining() {
    this.setState({ openchaining: true })
  }

  Expirationchange(e) {
    this.setState({ extexp: e.target.value })
  }
  extamountchange(e) {
    this.setState({ extamount: e.target.value })
  }

  async waitForTransaction(hash) {
    let receipt;
    while (!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }

    if (receipt.status === "0x0") {
      throw receipt
    }
    return receipt;
  }


  handlerextendadd(channelid) {
    let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);
    var amountInWei = AGI.inWei(web3,this.state.extamount);
    console.log("Extending channel id:" + channelid, " amount:"+amountInWei + " expiry: " + this.state.extexp);
    instanceEscrowContract.channelExtendAndAddFunds(channelid, this.state.extexp, this.state.extamount, { gas: 210000, gasPrice: 51 }, (error, txnHash) => {
    
      console.log("Channel extended and added funds is TXN Has : " + txnHash);
      this.onOpenchaining()
      this.waitForTransaction(txnHash).then(receipt => {
        console.log('Channel extended and deposited ' + this.state.ocvalue + ' from: ' + web3.eth.defaultAccount + 'receipt is ' + receipt);
      
        this.nextJobStep();
        
     
        
      })
      .catch((error) => {
        this.setState({depositextenderror: error })
        this.nextJobStep();
      })
    })
  }

  handleChange(event, value) {
    this.setState({ value });
  };

  hexToAscii(hexString) {
    let asciiString = Eth.toAscii(hexString);
    return asciiString.substr(0, asciiString.indexOf("\0")); // name is right-padded with null bytes
  }

  componentDidMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
  }

  componentWillUnmount() {
    if (this.watchWalletTimer) {
      clearInterval(this.watchWalletTimer);
    }

    if (this.watchNetworkTimer) {
      clearInterval(this.watchNetworkTimer);
    }
  }

  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      this.web3Initialized = isInitialized;
      if (isInitialized) {
        this.watchWalletTimer = setTimeout(() => this.watchWallet(), 500);
        this.watchNetworkTimer = setTimeout(() => this.watchNetwork(), 500);
      }
    }).catch(err => {
      console.error(err);
      this.web3Initialized = false;
    })
  }

  watchNetwork() {
    this.network.getChainID((chainId) => {
      if (chainId !== this.state.chainId) {
        this.setState({ chainId: chainId });
        this.loadDetails();
      }
    });
  }

  loadDetails() {
    console.log("In load details");

    if (typeof web3 === 'undefined') {
      return;
    }

    var user_address = web3.eth.defaultAccount;
    let mpeURL = this.network.getMarketplaceURL(this.state.chainId);
    if (typeof (mpeURL) !== 'undefined') {
      let _urlfetchprofile = mpeURL + 'fetch-profile'
      fetch(_urlfetchprofile, {
        'mode': 'cors',
        headers: {
          "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({ user_address: web3.eth.coinbase })
      }
      )
        .then(res => res.json())
        .then(data => this.setState({ userprofile: data }))
        .catch(err => console.log(err))

      /*
      let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);
      instanceTokenContract.balanceOf(user_address, ((err, balance) => {
      */
      let mpeTokenInstance = this.network.getMPEInstance(this.state.chainId);
      mpeTokenInstance.balances(user_address, ((err, balance) => {
        if (err) {
          console.log(err);
          this.setState({ escrowaccountbalance: balance });
          return;
        }
        //balance = balance / 10 ** 18
        console.log("balance of user is  " + balance);
        this.setState({ escrowaccountbalance: balance });
      }))
    }
    let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);

    instanceTokenContract.allowance(web3.eth.defaultAccount, this.network.getMPEAddress(this.state.chainId), (err, allowedbalance) => {
      if (err)
      {
        console.log(err)
        this.setState({allowedtokenbalance:allowedbalance["c"]})
      }
      this.setState({allowedtokenbalance:allowedbalance["c"]})
    }
    )
  }

  watchWallet() {
    this.network.getAccount((account) => {
      if (account !== this.state.account) {
        this.setState({ account: account });
      }
    });

    this.network.getEThBalance((balance) => {
      if (balance !== this.state.ethBalance) {
        this.setState({ ethBalance: balance });
      }
    }); 
  }

  nextJobStep() {
    this.onClosechaining()
  }

  handleAuthorize() {
    if (typeof web3 !== undefined) {
      let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);
      var user_address = web3.eth.defaultAccount
      var amount = this.state.authorizeamount; // Means 6 Tokens assuming number of decimals are 18
      var amountInWei = AGI.inWei(web3,amount);

      instanceTokenContract.approve(this.network.getMPEAddress(this.state.chainId), amountInWei, { gas: 210000, gasPrice: 23 }, (error, txnHash) => {
        console.log("Txn Hash for approved transaction is : " + txnHash);
          this.onOpenchaining()
          this.waitForTransaction(txnHash).then(receipt => {
            console.log('Opened channel and deposited ' + this.state.ocvalue + ' from: ' + user_address + 'reciept object is ' + receipt);
          this.nextJobStep();
        })
        .catch((error) =>{this.setState({approveerror: error})
        this.nextJobStep();
      } )
      })
    }
  }

  changeAuthorizeAmount(e) {
    this.setState({ authorizeamount: e.target.value })
  }


  handleDeposit() {

    if (typeof web3 !== undefined) {
      var user_address = web3.eth.defaultAccount;

      let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);
      var user_balance = 0
      //in balanceof takes user_address is the owner address as input parameter
      instanceTokenContract.balanceOf(web3.eth.defaultAccount, (err, balance) => {
        user_balance = balance
        console.log("balance of user is on " + balance / 10 ** 6)
      })

      
      //In allowance owner is useraddress and spender is the MPE address
      instanceTokenContract.allowance(web3.eth.defaultAccount, this.network.getMPEAddress(this.state.chainId), (err, allowedbalance) => {
        let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);
        console.log('here it is again')
        var amount = this.state.depositamount
        console.log("allowedbalance is " + allowedbalance + "," + typeof allowedbalance)
        console.log("amount is " + amount + "," + typeof amount)
        if (Number(amount) < Number(allowedbalance)) {
          console.log('here it is again 1')
          this.setState({ depositwarning: '' })
          // amount = 0.3; // Means 6 Tokens assuming number of decimals are 18
          //var amountInWei = new BigNumber(web3.toWei(amount, "ether") / (10 ** (this.decimals)));
          var amountInWei = AGI.inWei(web3,amount);
          // UnComment the code for real execution 
          // Getting the Gas Price
          var gasPrice;
          web3.eth.getGasPrice((err, price) => {
            console.log("Gas Price : " + price);
            gasPrice = price;
          })
          // Getting the Estimated Gas Price & Executing the transaction
          instanceEscrowContract.deposit.estimateGas(amountInWei, (err, estimatedGas) => {
            console.log("Estimated Gas Limit: " + estimatedGas);
            //gasPrice: web3.toWei(23, 'gwei') // For hardcoded to 23 Gas Price as most of the time gas Price is low
            instanceEscrowContract.deposit(amountInWei, { gas: 2100000, gasPrice: 23 }, (error, txnHash) => {
              console.log("TXN Has : " + txnHash);
              this.onOpenchaining()

              this.waitForTransaction(txnHash).then(receipt => {
                console.log('Opened channel and deposited ' + amountInWei + ' from: ' + user_address);
 
                this.nextJobStep();
              })
              .catch((error) => {this.setState({depositerror: error})
              this.nextJobStep(); 
            }
              )
            });
          });

        }
        else if (Number(amount) > Number(allowedbalance)) {
          this.setState({ depositwarning: 'Deposit amount should be less than approved balance ' + allowedbalance })
        }
      })
    }
  }

  changeDepositAmount(e) {
    this.setState({ depositamount: e.target.value })
  }
  handlewithdraw() {
    if (typeof web3 !== undefined) {
      var amount = this.state.withdrawalamount
      //var amountInWei = new BigNumber(web3.toWei(amount, "ether") / (10 ** (this.decimals)));
      var amountInWei = AGI.inWei(web3,amount);

      let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);
      var gasPrice;
      web3.eth.getGasPrice((err, price) => {
        console.log("Gas Price : " + price);
        gasPrice = price;
      })
      // Getting the Estimated Gas Price & Executing the transaction
      instanceEscrowContract.withdraw.estimateGas(amountInWei, (err, estimatedGas) => {
        console.log("Estimated Gas Limit: " + estimatedGas);
        instanceEscrowContract.withdraw(amount, { gas: 210000, gasPrice: 23 }, (error, txnHash) => {
          console.log("TXN Has : " + txnHash);
     
          this.onOpenchaining()

          this.waitForTransaction(txnHash).then(receipt => {
            console.log('Withdrawal of  ' + amountInWei + ' for: ' + web3.eth.defaultAccount);
            this.nextJobStep();
          })
          .catch((error)=>
          {
            this.setState({withdrawalerror:'There is a error in withdrawal with status ' + error.status})
            this.nextJobStep();
          })
        });
      });
    }
  }

  changeWithDrawalAmount(e) {
    this.setState({ withdrawalamount: e.target.value })
  }

  handleChange(event, value) {
    this.setState({ value });
  };

  handleChangeIndex(index) {
    this.setState({ value: index });
  };

  onKeyPressvalidator(event) {

    const keyCode = event.keyCode || event.which;

    //comparing pressed keycodes
    if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
      event.preventDefault()
    }
    else {
      let dots = event.target.value.split('.');
      if (dots.length > 1 && keyCode == 46)
        event.preventDefault()
    }
  }
  render() {
    const { value } = this.state;
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true
    //this.state.userprofile.map((res) => console.log(res["channel_id"]))
    return (
      <React.Fragment>
        <App />

        <div className="container">


          <div className="row">
            <div className=" col-xs-12 col-sm-12 col-md-6 col-lg-6 your-account-details" >
                <h3>Your Account details</h3>
              <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 agent-detail">
              

                <div className="row">
                  <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10"><label>Account</label></div>

                  {(typeof window.web3 !== 'undefined') ?
                    <React.Fragment>
                      <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 word-break no-padding">
                        <Tooltip title={<span style={{ fontSize: "15px" }}>Account</span>}>
                          <label>{web3.eth.accounts[0]}</label>

                        </Tooltip>
                        &nbsp;
                        {(web3.eth.coinbase !== null) ?
                          <CopyToClipboard text={web3.eth.accounts[0]} onCopy={() => message.success('Account address copied', 1)}>

                            <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 23 23"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
                            </a>

                          </CopyToClipboard> : null}
                      </div>
                    </React.Fragment>

                    : null}
                </div>
                <div className="row">
                  <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10"><label>Wallet Balance</label></div>
                  <Tooltip title={<span style={{ fontSize: "15px" }}>Wallet Balance</span>}>
                    <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding "><label >{this.state.ethBalance / 10 ** (18)} ETH</label></div></Tooltip>
                </div>
                <div className="row">
                  <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10"><label>Escow Balance</label></div>
                  <Tooltip title={<span style={{ fontSize: "15px" }}>Escow Balance</span>}>
                    <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding "><label >{AGI.toDecimal(this.state.escrowaccountbalance)} AGI</label></div></Tooltip>
                </div>
                <div className="row">
                  <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10"><label>Authorized Tokens</label></div>
                  <Tooltip title={<span style={{ fontSize: "15px" }}>Authorized Tokens</span>}>
                    <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding "><label>{AGI.toDecimal(this.state.allowedtokenbalance)} AGI</label></div></Tooltip>
                </div>
              </div>
            
              
            </div>

            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 manage-account" >
              <h3>Manage your Escrow account</h3>

              <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 amount-type">
                <Tabs style={{ padding: "0" }} value={value} onChange={(event, value) => this.handleChange(event, value)} indicatorColor='primary'>
                  <Tab label={<span style={{ fontSize: "13px" }}>Authorize&nbsp;<span><img src="./img/info-4.png" alt="User" /></span></span>} />
                  <Tab label={<span style={{ fontSize: "13px" }}>Deposit&nbsp;<span><img src="./img/info-4.png" alt="User" /></span></span>} />
                  <Tab label={<span style={{ fontSize: "13px" }}>WithDraw&nbsp;<span><img src="./img/info-4.png" alt="User" /></span></span>} />
                </Tabs>
                {value === 0 && <TabContainer>
                  <TextField
                    id="standard-name"
                    label={<span style={{ fontSize: "13px" }}>Amount</span>}
                    margin="normal"
                    onChange={this.changeAuthorizeAmount}
                    value={this.state.authorizeamount}
                    style={{ width: "100%", fontWeight: "bold" }}
                    onKeyPress={(e) => this.onKeyPressvalidator(e)}
                  /><br />
                  <div className="row">
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ color: "red", fontSize: "14px" }}>{this.state.approveerror!== '' ?ERROR_UTILS.sanitizeError(this.state.approveerror):''}</div>
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                    {(typeof web3 !== 'undefined') ?
                      (web3.eth.coinbase !== null) ?
                        <Tooltip title={<span style={{ fontSize: "15px" }}>Authorize</span>} style={{ fontsize: "15px" }}><button className="btn btn-primary mtb-10 " onClick={this.handleAuthorize} ><span>Authorize</span></button></Tooltip> :
                        <button className="btn btn-primary mtb-10" disabled><span >Authorize</span></button> :
                         <button className="btn btn-primary mtb-10" disabled><span >Authorize</span></button>
                    }
                  </div>
                  </div>
                </TabContainer>}
                {value === 1 && <TabContainer>
                  <TextField
                    id="depositamt"
                    label={<span style={{ fontSize: "13px" }}>Amount</span>}
                    margin="normal"
                    onChange={this.changeDepositAmount}
                    value={this.state.depositamount}
                    style={{ width: "100%", fontWeight: "bold" }}
                    onKeyPress={(e) => this.onKeyPressvalidator(e)}
                  />
                  <br />
                  <div className="row">
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ color: "red", fontSize: "14px" }}>{this.state.depositerror!== '' ?ERROR_UTILS.sanitizeError(this.state.depositerror):''}</div>
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                    {(typeof web3 !== 'undefined') ?
                      (web3.eth.coinbase !== null) ?
                        <Tooltip title={<span style={{ fontSize: "15px" }}>Deposit</span>}><button className="btn btn-primary " onClick={this.handleDeposit}><span style={{ fontSize: "15px" }}>Deposit</span></button></Tooltip> :
                        <button className="btn" disabled><span style={{ fontSize: "15px" }}>Deposit</span></button> :
                      <button className="btn" disabled><span style={{ fontSize: "15px" }}>Deposit</span></button>
                    }
                  </div>
                  </div>
                  <p style={{ color: "red", fontSize: "14px" }}>{this.state.depositwarning}</p>
                </TabContainer>}
                {value === 2 && <TabContainer>
                  <TextField
                    id="withdrawamt"
                    label={<span style={{ fontSize: "13px" }}>Amount</span>}
                    margin="normal"
                    onChange={this.changeWithDrawalAmount}
                    value={this.state.withdrawalamount}
                    style={{ width: "100%", fontWeight: "bold" }}
                    onKeyPress={(e) => this.onKeyPressvalidator(e)}
                  />
                  <br />
                  <div className="row">
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ color: "red", fontSize: "14px" }}>{this.state.withdrawalerror!== '' ?ERROR_UTILS.sanitizeError(this.state.withdrawalerror):''}</div>
                  <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                    {(typeof web3 !== 'undefined') ?
                      (web3.eth.coinbase !== null) ?
                        <Tooltip title={<span style={{ fontSize: "15px" }}>Withdraw</span>} >
                          <button type="button" className="btn btn-primary " onClick={this.handlewithdraw} ><span style={{ fontSize: "15px" }}>Withdraw</span></button>
                        </Tooltip> :
                        <button className="btn" disabled><span style={{ fontSize: "15px" }}>WithDraw</span></button>
                      : <button className="btn" disabled><span style={{ fontSize: "15px" }}>WithDraw</span></button>
                    }
                  </div>
                  </div> 
                  <p></p>
                </TabContainer>}
              </div>
            </div>
            <div>
              <Modal style={ModalStylesAlertWait}
                open={this.state.openchaining}
                onClose={this.onClosechaining}
              >
                <Slide direction="left" in={this.state.openchaining} mountonEnter unmountOnExit>
                  <React.Fragment>
                    <Typography component={'div'} style={{ fontSize: "13px", lineHeight: "15px" }}>
                      <div className="col-sm-12 col-md-6 col-lg-6">
                        Your transaction is being mined.
         </div>
                      <div style={{ width: '100px' }} className="col-sm-12 col-md-6 col-lg-6">
                        <CircularProgress
                          backgroundpadding={6}
                          styles={{
                            background: {
                              fill: '#3e98c7',
                            },
                            text: {
                              fill: '#fff',
                            },
                            path: {
                              stroke: '#fff',
                            },
                            trail: { stroke: 'transparent' },
                          }}
                        />
                      </div>
                    </Typography>
                  </React.Fragment>
                </Slide>
              </Modal>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 channel-info " >
              <div className="row channel-header">
                <div className="col-sm-3 col-md-2 col-lg-3 hidden-xs">
                  <span>Channels</span>
                </div>
                <div className="col-sm-3 col-md-3 col-lg-3 hidden-xs">
                  <span>Balance</span>
                </div>
                <div className="col-sm-3 col-md-3 col-lg-3 hidden-xs">
                  <span>Pending</span>
                </div>
                <div className="col-sm-2 col-md-2 col-lg-2 hidden-xs">
                  <span>Expiry Time</span>
                </div>
                <div className="col-sm-1 col-md-2 col-lg-1 hidden-xs">&nbsp;</div>
              </div>
              {this.state.userprofile.map((row, index) =>
                <ExpansionPanel key={index} style={{ borderRadius: "5px", backgroundColor: "#E3F0FF", marginBottom: "15px" }}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} style={{ padding: "0px" }}>
                    <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["channel_id"]}</span></div>
                    <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <Typography><span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["balance"]}</span></Typography></div>
                    <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <Typography><span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["pending"]}</span></Typography></div>
                    <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <Typography><span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["expiration"]}</span></Typography></div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{ backgroundColor: "#F1F1F1" }}>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-7 no-padding" >
                    lorem ipsum
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-5 pull-right" >
                      <div className="row">
                        <div className="col-md-12 pull-right no-padding">
                          <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                            <label>Amount</label></div>
                          <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                            <Tooltip title={<span style={{ fontSize: "15px" }}>Amount</span>}>
                              <input type="text" value={this.state.extamount} name="amount" className="channels-input" onChange={(e) => this.extamountchange(e)} onKeyPress={(e) => this.onKeyPressvalidator(e)} />
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12 pull-right no-padding">
                          <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                            <label>New Expiration</label></div>
                          <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                            <Tooltip title={<span style={{ fontSize: "15px" }}>Expiration</span>}>
                              <input type="text" value={this.state.extexp} name="newexpiration" className="channels-input" onChange={(e) => this.Expirationchange(e)} />
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {(typeof web3 !== 'undefined') ? <Tooltip title={<span style={{ fontSize: "15px" }}>Confirm</span>} ><button type="button" className="btn btn-primary " onClick={() => this.handlerextendadd(row["channel_id"])}><span style={{ fontSize: "15px" }}>Confirm</span></button></Tooltip> :
                          <Tooltip title={<span style={{ fontSize: "15px" }} >Confirm</span>} ><button type="button" className="btn " disabled ><span style={{ fontSize: "15px" }}>Confirm</span></button></Tooltip>
                        }
                      </div>
                      <p style={{ color: "red", fontSize: "14px" }}>{this.state.depositextenderror!==''?ERROR_UTILS.sanitizeError(this.state.depositextenderror):''}</p>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}