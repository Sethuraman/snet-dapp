import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/es/CardContent/CardContent';
import Button from '@material-ui/core/es/Button/Button';
import CardActions from '@material-ui/core/es/CardActions/CardActions';

const styles = {
  main: {
    paddingRight: '15px',
    paddingLeft: '15px',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  titleBlock: {
    margin: '15px 0 13px 16px',
  },
  title: {
    fontFamily: 'Arial',
    textTransform: 'uppercase',
  },
  cardDeck: {
    display: 'flex',
    marginBottom: '30px',
    padding: '0',
    border: 'none',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: 'none',
    marginRight: '15px',
    marginLeft: '15px',
    boxShadow: '0 0 13px #e8e8e8',
    borderRadius: '7px',
    backgroundColor: '#e3f0ff',
    marginBottom: '20px',
    height: '190px',
  },
};

const newsData = [
  {
    title: 'Joe Rogan Learns About Blockchain',
    content: 'Revisiting the basics of blockchain technology on the Joe Rogan Experience podcast.',
    link: 'https://blog.singularitynet.io/joe-rogan-learns-about-blockchain-technology-with-dr-ben-goertzel-a9c17566d994',
  },
  {
    title: 'SINGULARITY STUDIO',
    content: 'SingularityNET & Singularity Studio Blitzscaling Toward the Singularity',
    link: 'https://blog.singularitynet.io/singularitynet-singularity-studio-blitzscaling-toward-the-singularity-2c27919e6c76',
  },
  {
    title: 'DATA AS LABOR',
    content: 'Rethinking Jobs In The Information age as AI gets more prevalant and ubiqutious',
    link: 'https://blog.singularitynet.io/data-as-labour-cfed2e2dc0d4',
  },
  {
    title: 'AGI & THE NEW SPACE FRONTIER',
    content: 'Exploring the evolution of technologies that will shape our lives',
    link: 'https://blog.singularitynet.io/room-for-innovation-403511a264a6',
  }
];

const News = ({classes}) => (
  <section className={classes.main}>
    <div className={classes.titleBlock}>
      <Typography className={classes.title} variant="h6" gutterBottom>
        NEW &amp; HOT IN COMMUNITY
      </Typography>
    </div>
    <div className={classes.cardDeck}>
      {newsData.map((news, index) =>
        (<Card key={index} className={classes.card}>
          <CardContent>
            <Typography className={classes.title} variant="subtitle1" gutterBottom>
              {news.title}
            </Typography>
            <p>{news.content}</p>
          </CardContent>
          <CardActions>
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer">
              <Button variant="contained" color="primary">Read</Button>
            </a>
          </CardActions>
        </Card>))}
    </div>
  </section>
);

export default withStyles(styles)(News);