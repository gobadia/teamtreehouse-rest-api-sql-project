'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const {User, Course} = require('./models');
const {authenticateUser} = require('./middleware/auth-user')


// Handler function to wrap each route.
function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        // Forward error to the global error handler
        next(error);
      }
    }
  }


// Route that returns a list of users.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  try {
    console.log(`Current User: ${JSON.stringify(req.currentUser)}`);
    let users = await User.findByPk(req.currentUser.id, {attributes: ['id', 'firstName', 'lastName', 'emailAddress']});
    //return status 200 and list of users
    res.status(200).json(users);
  }catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }

  }));

  // Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        //set location to / and set status to 201
        res.location('/').status(201).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }
  }));


// Route that returns a list of courses.
router.get('/courses', asyncHandler(async (req, res) => {
  try{
    let courses = await Course.findAll({
      attributes: ['id', 'title', 'description','estimatedTime', 'materialsNeeded', 'userId'], 
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
        as: 'User',
      }]
  });
    //set status to 200 and return list of courses
    res.status(200).json(courses);
  }catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
  }));


// Route that returns a specific course with user that owns course
router.get('/courses/:id', asyncHandler(async (req, res) => {
  try{  
    let courseID = req.params.id
    let courses = await Course.findByPk(courseID, 
      {attributes: ['id', 'title', 'description','estimatedTime', 'materialsNeeded', 'userId'], 
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
          as: 'User',
        }]
      });
    if(courses){
      //if course exists return it
      res.status(200).json(courses);
    }
    else{
      //else return course not found 404
      res.sendStatus(404);
    }
  }catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }



  }));

// Route that creates a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    let course; 
    try{
      course = await Course.create(req.body);
      // create course then update location to course and return 201
      res.location(`/courses/${course.id}`).status(201).end();
    } catch(error){
      if(error.name === "SequelizeValidationError"){
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      }
      else{
        throw error;
      }
  
    }
  }));

/* Update a Course. */
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course;
    try{
      //get the course by ID
      course = await Course.findByPk(req.params.id);
      if(course){
        //if course exists, update the course with info provided in request body
        if(req.currentUser.id == course.userId){
          await course.update(req.body);
          res.sendStatus(204);
        }
        else{
          //user doesn't own course, send error
          let error = new Error();
          error.message = `Can't update course if you aren't the owner`;
          error.status = 403;
          throw error;
        }
      } else{
        // course doesn't exist, send 404
        res.sendStatus(404);
      }
    } catch (error){
      if(error.name === "SequelizeValidationError") {        
        //render the course detail page with errors and details entered
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });  
      } else{
        throw error;
      }
  
    }
  
  }));

  /* Delete a course. */
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course;
    try{
      //get the course by ID
      course = await Course.findByPk(req.params.id);
      if(course){
        if(req.currentUser.id == course.userId){
          //if course exists and user is the owner, delete the course
          await course.destroy();
          res.sendStatus(204);
        }
        else{
          //user doesn't own course, send error
          let error = new Error();
          error.message = `Can't delete course if you aren't the owner`;
          error.status = 403;
          throw error;
        }
      } else{
        //course doesn't exist
        res.sendStatus(404);
      }
    } catch (error){   
        throw error;
    }
  
  }));
  module.exports = router;
