/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();
const URI = process.env.MONGO_URI;
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const bookStoreSchema = new mongoose.Schema({
  title : { type: String  },
  commentcount : { type: Number },
  comments : { type: [String] }
});
let book = mongoose.model("BookStore", bookStoreSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      book.find((err,data)=> {
        if(err || !data){
          return res.json([]);
        }
        else{
          return res.json(data);
        }
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      console.log(title);
      if(title == '' || title == undefined){
        return res.send('missing required field title');
      }
      else{
        let bookDetail=new book({'title':title,'comment':[],'commentcount':0});
        book.create(bookDetail,(err,data)=> {
          if(err || !data){
            console.error(err);
          }
          else{
            return res.json({ '_id':data._id,'title':title});
          }
        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      book.deleteMany((err)=> {
        console.log(err);
        if(err){
          return res.send('complete delete unsuccessful');
        }
        else{
          console.log('complete delete successful');
          return res.send('complete delete successful');
        }
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      book.findById(bookid)
        .select({'_v':0,'commentcount':0})
        .exec((err,data)=> {
        if(err || !data){
          return res.send('no book exists');
        }
        else
        {
          return res.json(data);
        }
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if(comment == '' || comment == undefined){
        return res.send('missing required field comment');
      }
      else
      {
        book.findById(bookid)
          .exec((err,data)=> {
          if(err || !data){
            return res.send('no book exists');
          }
          else
          {
            data.commentcount++;
            data.comments.push(comment);
            data.save((err, updatedData) => {
              if(err || !updatedData){
                console.log(err);
              }
              else{
                return res.json({title:updatedData.title,
                                '_id':updatedData._id,
                                comments:updatedData.comments});
              }
            });
          }
        });
      }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      book.findByIdAndRemove(bookid,(err,data)=> {
        console.log(err);
        if(err || !data){
          return res.send('no book exists');
        }
        else{
          console.log('delete successful');
          return res.send('delete successful');
        }
      });
    });
  
};
