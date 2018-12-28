import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import headerImage from '../images/header-img.png';
import logoImage from '../images/singularity-logo.png';
import userImage from '../images/user.png';
import homeImage from '../images/home-icon.png';
import InputBase from "@material-ui/core/es/InputBase/InputBase";

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '198px',
    padding: '10px',
    backgroundImage: `url(${headerImage})`,
    backgroundSize: '100% 100%',
  },
  userControls: {
    padding: '0px',
    verticalAlign: 'text-bottom',
    textAlign: 'right',
    display: 'flex',
  },
  search: {
    border: 'none',
    padding: '0px 10px',
    borderRadius: '5px',
    backgroundColor: '#3e3ae3',
    width: '250px',
    height: '35px',
    margin: '0',
    '&::placeholder': {
      color: '#6c757d',
      opacity: '1',
      fontSize: '90%'
    },
  },
  user: {
    marginLeft: '12px',
    marginTop: '5px',
  },
  userImage: {
    marginLeft: '9px',
  },
};

const Header = ({classes}) => (
  <header className={classes.header}>
    <h1>
      <img src={logoImage} alt="SingularityNET"/>
    </h1>
    <div className={classes.userControls}>
      <InputBase
        id="srch-term"
        type="text"
        placeholder="Search"
        name="srch-term"
        className={classes.search}
        margin="none"
        inputProps={{ className: classes.search }}
      />
      <div className={classes.user}>
        <img src={homeImage} alt=""/>{" "}
        <img src={userImage} alt="User" className={classes.userImage}/>
      </div>
    </div>
  </header>
);

export default withStyles(styles)(Header);