'use strict'

const express = require('express');
const server = express();
const axios = require('axios');
let PORT = process.env.PORT || 3000; 
const cors = require('cors');
require('dotenv').config();
const pg = require('pg');
const APIKey = process.env.APIKey;
server.use(cors())
const data = require('./Movie Data/data.json');

server.use(express.json())
const client = new pg.Client(process.env.DATABASE_URL)

server.get('/', homeHandler)
server.get('/favorite', favoriteHandler)
server.get('/trending', trendingHandler)
server.post('/addMovie', addFav)
server.get('/error', Error500)
server.get('*', Error400)


function homeHandler(req, res) {
  let home = new movie(data.title, data.poster_path, data.overview)

  res.status(200).send(home);
  ;
}

function movie(title, poster_path, overview) {
  this.title = title,
    this.poster_path = poster_path,
    this.overview = overview

}

function favoriteHandler(req, res) {
    const sql = `SELECT * FROM addMovie;`;
    client.query(sql)
    .then(data=>{
        res.send(data.rows);
        console.log('data from DB', data.rows)
    }).catch((error)=>{
        console.log('sorry you have something error', error)
      res.status(500).send(error);
    })
}

function Error500(req, res) {
  let err5 = {
    "status": 500,

    "responseText": 'Sorry, something went wrong'
  }
  res.status(err5.status).send(err5);
};

function Error400(req, res) {
  res.status(404).send('page not found error')
};


function trendingHandler(req, res) {
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIKey}`

  axios.get(url)
    .then(result => {

      let mapResult = result.data.results.map(item => {
        let singleResult = new dataTrending(item.id, item.title, item.release_date, item.poster_path, item.overview);
        return singleResult;
      })
      console.log(mapResult)
      res.send(mapResult)

    })

    .catch((error) => {
      console.log('sorry you have something error', error)
      res.status(500).send(error);
    })

};

function addFav(req, res){
    const movie = req.body;
      console.log(movie);
      const sql = `INSERT INTO addMovie (id, title, release_date)
      VALUES ($1, $2, $3);`
      const values = [movie.id, movie.title , movie.mins]; 
      client.query(sql,values)
      .then(data=>{
          res.send("The data has been added successfully");
      })
      .catch((error)=>{
        Error500(error,req,res)
      })
  }



function dataTrending(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}


client.connect()
.then(()=>{
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}: I'm ready`)
  })
})