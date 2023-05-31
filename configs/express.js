const express = require("express"),
  // morgan ไว้ show log ใน console
  morgan = require("morgan"),
  cors = require("cors");
(passport = require("passport")), (path = require("path"));

// process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//
const DeviceDetector = require("node-device-detector");
const ClientHints = require("node-device-detector/client-hints");

module.exports = async (app) => {
  const db = require("../models/index.js");

  // CORS
  const allowedOrigins = [
    "*",
    "http://localhost:8085",
    "http://localhost:8088",
    "http://178.128.216.177:8088"
  ];
  // const corsOptions = {
  //   origin: function (origin, callback) {
  //     if (!origin) return callback(null, true);
  //     if (allowedOrigins.indexOf(origin) === -1) {
  //       const msg =
  //         "The CORS policy for this site does not " +
  //         "allow access from the specified Origin.";
  //       return callback(new Error(msg), false);
  //     }
  //     return callback(null, true);
  //   },
  // };
  // app.use(cors(corsOptions));

  app.use(
    cors({
      origin: "*",
    })
  );


  // for parsing multipart/form-data
  // const multer = require('multer');
  // const upload = multer();
  // app.use(upload.single('file_upload'));
  // app.use(express.static('public'));
  // Parser Body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger
  app.use(morgan("dev"));

  // device
  const deviceDetector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
  });
  const clientHints = new ClientHints();

  // create middleware
  const middlewareDetect = (req, res, next) => {
    const useragent = req.headers["user-agent"];
    const clientHintsData = clientHints.parse(res.headers);

    req.useragent = useragent;
    req.device = deviceDetector.detect(useragent, clientHintsData);
    req.bot = deviceDetector.parseBot(useragent);
    next();
  };

  app.use(middlewareDetect);

  // Passport
  require("../configs/passport");

  // Static file
  app.use("/static", express.static(path.join(__dirname, "../public")));
  // http://localhost:3000/static/uploads/images/users/user-1-1652789767517.jpeg

  // Custom Response Format
  app.use(require("../configs/responseFormat"));
};
