const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

let COURSES = require('./data/courses');
let STUDENTS = require('./data/students');

const typeDefs = `
  # TODO: create a CourseType type
  # with the same fields as before
  type CourseType {
    id: ID!
    name: String!
    description: String
    level: String
  }

  # TODO: create a StudentType type
  # with the same fields as before
  # NOTE: think about what the courses
  # field should be
  type StudentType {
    id: ID!
    firstName: String!
    lastName: String!
    active: Boolean!
    course: [CourseType]!
  }

  # TODO: create a CourseInput input type
  # with the same fields as before
  input CourseInput {
    id: ID
    name: String!
    description: String
    level: String
  }

  # TODO: create a CourseInput input type
  # with the same fields as before
  input StudentInput {
    id: ID
    firstName: String!
    lastName: String!
    active: Boolean!
    coursesIds: [ID]!
  }

  # TODO: add the query fields we had before
  # so we can get all courses and all students
  type Query {
    allStudents: [StudentType]
    allCourses: [CourseType]
  }

  # TODO: add the mutation fields we had before
  # so we can get all courses and all students
  type Mutation {
    createCourse(params: CourseInput): CourseType
    updateCourse(params: CourseInput): CourseType
    deleteCourse(params: ID): CourseType
    createStudent(params: StudentInput): StudentType
    updateStudent(params: StudentInput): StudentType
    deleteStudent(params: ID): StudentType
  }
`;

// Freebie!
const resolvers = {
  Query: {
    allCourses: () => {
      return COURSES;
    },
    allStudents: () => {
      return STUDENTS;
    }
  },
  Mutation: {
    createCourse: (_, { name, description, level }) => {
      const id = COURSES.length + 1;
      const input = { id, name, description, level };
      COURSES.push(input);
      return input;
    },
    updateCourse: (_, { id, name, description, level }) => {
      const input = { id, name, description, level };
      COURSES = COURSES.map(course => {
        if (course.id == id) {
          course = input;
        }
        return course;
      });
      return COURSES.find(course => course.id === id);
    },
    deleteCourse: (_, { id }) => {
      const course = COURSES.find(course => course.id === id);
      if (!course) {
        return;
      }
      const index = COURSES.indexOf(course);
      COURSES.splice(index, 1);
      return course;
    },
    createStudent: (_, { firstName, lastName, active, coursesIds }) => {
      const id = STUDENTS.length + 1;
      const courses = [];
      coursesIds.forEach(id => {
        courses.push(
          COURSES.find(course => {
            return course.id === id;
          })
        );
      });
      const input = {
        id,
        firstName,
        lastName,
        active,
        courses
      };
      STUDENTS.push(input);
      return input;
    },
    updateStudent: (_, { id, firstName, lastName, active, coursesIds }) => {
      let input = { id, firstName, lastName, active };
      input.courses = [];
      coursesIds.forEach(courseId => {
        input.courses.push(COURSES.find(course => course.id === courseId));
      });
      STUDENTS = STUDENTS.map(student => {
        if (student.id === id) {
          student = input;
        }
        return student;
      });
      return STUDENTS.find(student => student.id === id);
    },
    deleteStudent: (_, { id }) => {
      const student = STUDENTS.find(student => student.id === id);
      if (!student) {
        return;
      }
      const index = STUDENTS.indexOf(student);
      STUDENTS.splice(index, 1);
      return student;
    }
  }
};

// Use makeExecutableSchema to wire up
// the type definitions and the resolvers
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  cors(),
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening at localhost:${port}`);
