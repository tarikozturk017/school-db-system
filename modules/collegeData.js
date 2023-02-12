// const fs = require("fs");

// class Data{
//     constructor(students, courses){
//         this.students = students;
//         this.courses = courses;
//     }
// }

// let dataCollection = null;

const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "d8vm5fl5mcgmta",
  "luvnvsgqmweejb",
  "c259b906e84f8ad7a39b8f1d9392d980090f9d7785c01e4424285955e0e287f1",
  {
    host: "ec2-50-19-255-190.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Student = sequelize.define("Student", {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  emailName: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
});

var Course = sequelize.define("Course", {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, { foreignKey: "course" });

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(function () {
        resolve();
      })
      .catch(function (error) {
        reject("unable to sync the database");
      });
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then(function (student) {
        resolve(student);
      })
      .catch(function (error) {
        reject("no results returned");
      });
  });
};

module.exports.getCourses = function () {
  return new Promise(function (resolve, reject) {
    Course.findAll()
      .then(function (course) {
        resolve(course);
      })
      .catch(function (error) {
        reject("no results returned");
      });
  });
};

module.exports.getStudentByNum = function (num) {
  return new Promise(function (resolve, reject) {
    Student.findAll({
      where: {
        studentNum: num,
      },
    })
      .then(function (data) {
        resolve(data[0]);
      })
      .catch(function (error) {
        reject("no results returned");
      });
  });
};

module.exports.getStudentsByCourse = function (course) {
  return new Promise(function (resolve, reject) {
    Student.findAll({
      where: {
        course: course,
      },
    })
      .then(function (student) {
        resolve(student);
      })
      .catch(function (error) {
        reject("no results returned");
      });
  });
};

module.exports.getCourseById = function (id) {
  return new Promise(function (resolve, reject) {
    Course.findAll({
      where: {
        courseId: id,
      },
    })
      .then(function (data) {
        resolve(data[0]);
      })
      .catch(function (error) {
        reject("no results returned");
      });
  });
};

module.exports.addStudent = function (studentData) {
  return new Promise(function (resolve, reject) {
    studentData.TA = studentData.TA ? true : false;
    for (const prop in studentData) {
      if (studentData[prop] == "") {
        studentData[prop] = null;
      }
    }
    Student.create(studentData)
      .then(function (data) {
        resolve(data);
      })
      .catch(function (error) {
        reject("unable to create student");
      });
  });
};

module.exports.updateStudent = function (studentData) {
  return new Promise(function (resolve, reject) {
    studentData.TA = studentData.TA ? true : false;
    for (const i in studentData) {
      if (studentData.i == "") {
        studentData.i = null;
      }
    }
    Student.update(
      { studentData },
      { where: { studentNum: studentData.studentNum } }
    )
      .then(function () {
        resolve();
      })
      .catch(function (err) {
        reject("unable to update student");
      });
  });
};

module.exports.addCourse = function (courseData) {
  return new Promise(function (resolve, reject) {
    for (const prop in courseData) {
      if (courseData[prop] == "") {
        courseData[prop] = null;
      }
    }
    Course.create(courseData)
      .then(function (data) {
        resolve(data);
      })
      .catch(function (error) {
        reject("unable to create course");
      });
  });
};

module.exports.updateCourse = function (courseData) {
  return new Promise(function (resolve, reject) {
    for (const i in courseData) {
      if (courseData.i == "") {
        courseData.i = null;
      }
    }
    Course.update(
      { courseData },
      {
        courseId: courseData.courseId,
      }
    )
      .then(function () {
        resolve();
      })
      .catch(function (err) {
        reject("unable to update course");
      });
  });
};

// module.exports.updateCourse = function (courseData) {
//   return new Promise(function (resolve, reject) {
//     for (const i in courseData) {
//       if (courseData.i == "") {
//         courseData.i = null;
//       }
//     }
//     Course.update(courseData)
//       .then(function () {
//         resolve();
//       })
//       .catch(function (err) {
//         reject("unable to update course");
//       });
//   });
// };

module.exports.deleteStudentByNum = function (num) {
  return new Promise(function (resolve, reject) {
    Student.destroy({ where: { studentNum: num } })
      .then(function () {
        resolve("destroyed");
      })
      .catch(function (err) {
        reject("unable to destroy student");
      });
  });
};

module.exports.deleteCourseById = function (id) {
  return new Promise(function (resolve, reject) {
    Course.destroy({ where: { courseId: id } })
      .then(function () {
        resolve("destroyed");
      })
      .catch(function (err) {
        reject("unable to destroy course");
      });
  });
};

// module.exports.deleteStudentByNum = function (studentNum) {
//   return new Promise(function (resolve, reject) {
//     Student.destroy({
//       where: { studentNum: studentNum },
//     })
//       .then(function () {
//         resolve();
//       })
//       .catch(function (error) {
//         reject("cannot delete the student");
//       });
//   });
// };
