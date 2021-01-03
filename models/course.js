'use strict';
const { Model, DataTypes } = require('sequelize');
//const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    title: {
      type: DataTypes.STRING, 
      allowNull: false, 
      validate: {
        notNull: {
          msg: 'A course title is required'
        },
        notEmpty: {
          msg: 'Please provide a title for the course'
        }
      }
    },
    description: {
        type: DataTypes.TEXT, 
        allowNull: false, 
        validate: {
          notNull: {
            msg: 'A course description is required.'
          },
          notEmpty: {
            msg: 'Please provide a course description.'
          }
        }
      },
      estimatedTime: {
        type: DataTypes.STRING, 
        allowNull: true
      },
      materialsNeeded: {
        type: DataTypes.STRING, 
        allowNull: true
      }
  }, { sequelize });

  Course.associate = (models) => {
    // TODO Add associations.
    Course.belongsTo(models.User, {
      //as: 'user', // allias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };

  return Course;
};