const router = require("express").Router();
const controllers = require("../../controllers/company.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
const {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
} = require("../../configs/errorMethods");

const multer = require('multer');
const storage = multer.diskStorage({
    destination: "public/uploads/company/",
    filename: function (req, file, callback) {
        let filename = "company-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        filename = filename.toLowerCase();
        callback(null, filename.toLowerCase())
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(ErrorBadRequest("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
    limits: { fieldSize: 10 * 1024 * 1024 }, //10MB
});

// const upload = multer({ storage })

// const storage = multer.diskStorage({
//     destination: "public/uploads/company/",
//     filename: function (req, file, cb) {
//       cb(
//         null,
//         "company-" +
//         //   req.params.id +
//         //   "-" +
//           Date.now() +
//           path.extname(file.originalname)
//         // path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname)
//       );
//     },
//   });

router.get(
    "/",
    auth.required,
    controllers.onGetAll
);

router.get(
    "/:id",
    auth.required,
    controllers.onGetById
);

router.post(
    "/",
    auth.required,
    upload.fields([{name: "namecard_file_upload", maxCount: 1 }, {name: "map_file_upload", maxCount: 1 }]),
    controllers.onInsert,
);

router.put(
    "/:id",
    auth.required,
    upload.fields([{name: "namecard_file_upload", maxCount: 1 }, {name: "map_file_upload", maxCount: 1 }]),
    controllers.onUpdate
);

router.delete(
    "/:id",
    auth.required,
    controllers.onDelete
);

module.exports = router;