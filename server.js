/*********************************************************************************
 * WEB322 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
 * assignment has been copied manually or electronically from any other source (including web sites) or
 * distributed to other students.
 *
 * Name: Tarik Ozturk Student ID: 155237209 Date: 2022/08/08
 *
 * Online (Heroku) Link: ________________________________________________________
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");
const clientSessions = require("client-sessions");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine(
  ".hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(express.static("public"));
// app.use(express.urlencoded({ extended: false })); ???????
app.use(express.urlencoded({ extended: true }));

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

// call this function after the http server starts listening for requests
// function onHttpStart() {
//   console.log("Express http server listening on: " + HTTP_PORT);
// }

// A simple user object, hardcoded for this example
const user = {
  username: "sampleuser",
  password: "samplepassword",
};

// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// working
// Display the login html page
app.get("/login", function (req, res) {
  res.render("login", { layout: false });
});

// The login route that adds the user to the session
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    // Render 'missing credentials'
    return res.render("login", {
      errorMsg: "Missing credentials.",
      layout: false,
    });
  }

  // use sample "user" (declared above)
  if (username === user.username && password === user.password) {
    // Add the user on the session and redirect them to the dashboard page.
    req.session.user = {
      username: user.username,
      // email: user.email
    };

    res.render("home");
  } else {
    // render 'invalid username or password'
    res.render("login", {
      errorMsg: "invalid username or password!",
      layout: false,
    });
  }
});

// Log a user out by destroying their session
// and redirecting them to /login
app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/login");
});

// An authenticated route that requires the user to be logged in.
// Notice the middleware 'ensureLogin' that comes before the function
// that renders the dashboard page
app.get("/", ensureLogin, (req, res) => {
  res.render("home", { user: req.session.user });
});

// app.get("/", ensureLogin, (req, res) => {
//   res.render("home");
// });

app.get("/about", ensureLogin, (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", ensureLogin, (req, res) => {
  res.render("htmlDemo");
});

app.get("/students", ensureLogin, (req, res) => {
  if (req.query.course) {
    data
      .getStudentsByCourse(req.query.course)
      .then((data) => {
        res.render("students", { students: data });
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else {
    data
      .getAllStudents()
      .then((data) => {
        if (data.length > 0) {
          res.render("students", { students: data });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  }
});

app.get("/students/add", ensureLogin, (req, res) => {
  data
    .getCourses()
    .then((data) => {
      res.render("addStudent", { courses: data });
    })
    .catch((err) => {
      res.render("addStudent", { courses: [] });
    });
});

app.post("/students/add", ensureLogin, (req, res) => {
  data.addStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

app.get("/student/:studentNum", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data
    .getStudentByNum(req.params.studentNum)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(data.getCourses)
    .then((data) => {
      viewData.courses = data; // store course data in the "viewData" object as "courses"
      // loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching
      // viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    });
});

app.post("/student/update", ensureLogin, (req, res) => {
  data
    .updateStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => {
      res.status(404).send("Unable to update student");
    });
});

app.get("/courses", ensureLogin, (req, res) => {
  data
    .getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("courses", { message: "no results" });
    });
});

// I don't think there's a problem here
app.get("/course/:id", ensureLogin, (req, res) => {
  data
    .getCourseById(req.params.id)
    .then((data) => {
      if (typeof data === "undefined") {
        res.status(404).send("Course Not Found");
      } else {
        res.render("course", { course: data });
      }
    })
    .catch((err) => {
      res.render("course", { message: "no results" });
    });
});

// I don't think there's a problem here
app.get("/courses/add", ensureLogin, (req, res) => {
  res.render("addCourse");
});

app.post("/courses/add", ensureLogin, (req, res) => {
  data.addCourse(req.body).then(() => {
    res.redirect("/courses");
  });
});

// I don't think there's a problem here
app.post("/course/update", ensureLogin, (req, res) => {
  data
    .updateCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => {
      res.status(404).send("Unable to update student");
    });
});
// I don't think there's a problem here

app.get("/course/delete/:id", (req, res) => {
  data
    .deleteCourseById(req.params.id)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to remove course / course not found");
    });
});

app.get("/student/delete/:studentNum", (req, res) => {
  console.log(req.params.studentNum);
  data
    .deleteStudentByNum(req.params.studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to remove student / student not found");
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

data
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });
