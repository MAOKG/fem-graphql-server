const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

const COURSES = require('./data/courses');
const STUDENTS = require('./data/students');

const CourseType = new gql.GraphQLObjectType({
  name: 'CourseType',
  fields: {
    id: { type: gql.GraphQLID },
    name: { type: gql.GraphQLString },
    description: { type: gql.GraphQLString },
    level: { type: gql.GraphQLString }
  }
});

const StudentType = new gql.GraphQLObjectType({
  name: 'StudentType',
  fields: {
    id: { type: gql.GraphQLID },
    firstName: { type: gql.GraphQLString },
    lastName: { type: gql.GraphQLString },
    active: { type: gql.GraphQLBoolean },

    // TODO: make the courses field require an argument
    // called 'level' which filters out the courses array
    // based on that value. Use the parent (root) data in the
    // resolve function to get access to the proper data
    courses: {
      type: new gql.GraphQLList(CourseType),
      args: {
        level: { type: new gql.GraphQLNonNull(gql.GraphQLString) }
      },
      resolve(root, { level }) {
        return root.courses.filter(course => course.level === level);
      }
    }
  }
});

const schema = new gql.GraphQLSchema({
  query: new gql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      allCourses: {
        type: new gql.GraphQLList(CourseType),
        resolve() {
          return COURSES;
        }
      },
      allStudents: {
        type: new gql.GraphQLList(StudentType),
        resolve() {
          return STUDENTS;
        }
      },

      // TODO: make this new 'courseById' field search for a
      // course based on the specific ID passed as an argument.
      // Use the JavaScript find method to get the result
      courseById: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return COURSES.find(course => course.id === id);
        }
      },

      // TODO: make this new 'studentById' field search for a
      // student based on the specific ID passed as an argument.
      // Use the JavaScript find method to get the result
      studentById: {
        type: StudentType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return STUDENTS.find(student => student.id === id);
        }
      },

      // TODO: make this new 'searchStudentByName' field search for
      // students by last name based on the 'name' argument passed in.
      // Use a RegExp and the JavaScript filter method to look for
      // students that match (or partially match) the name
      searchStudentsByName: {
        type: new gql.GraphQLList(StudentType),
        args: {
          name: { type: new gql.GraphQLNonNull(gql.GraphQLString) }
        },
        resolve(_, { name }) {
          const pattern = new RegExp(name, 'i');
          return STUDENTS.filter(student => {
            return pattern.test(student.lastName);
          });
        }
      }
    }
  })
});

app.use(
  '/graphql',
  cors(),
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening on localhost:${port}`);
