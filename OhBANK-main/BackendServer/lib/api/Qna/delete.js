var express = require("express");
var router = express.Router();
var Model = require("../../../models/index");
var Response = require("../../Response");
var statusCodes = require("../../statusCodes");
var { validateUserToken } = require("../../../middlewares/validateToken");
var {
  decryptAuthRequest,
  encryptResponse,
} = require("../../../middlewares/crypt");
/**
 * QnA file list route
 * This endpoint allows to view list of files of a question
 * @path                             - /api/qna/write
 * @middleware
 * @param id
 * @return                           - isSuccess
 */
router.post("/", decryptAuthRequest, (req, res) => {
  var r = new Response();
  let qna_id = req.body.qna_id;

  Model.qna
    .findOne({
      where: {
        id: req.body.qna_id,
      },
      attributes: ["writer_id"],
    })
    .then((data) => {
      if (data.dataValues.writer_id === req.user_id) {
        Model.file
          .findAll({
            where: {
              qna_id: qna_id,
            },
            attributes: ["saved_name"],
          })
          .then((data) => {
            // DB에서 파일 삭제
            Model.file
              .destroy({
                where: {
                  qna_id: qna_id,
                },
              })
              .then((data) => {
                // QnA 삭제
                Model.qna
                  .destroy({
                    where: {
                      id: qna_id,
                    },
                  })
                  .then((data) => {
                    r.status = statusCodes.SUCCESS;
                    return res.json(encryptResponse(r));
                  })
                  .catch((err) => {
                    r.status = statusCodes.SERVER_ERROR;
                    r.data = {
                      message: "invalid input",
                    };
                    return res.json(encryptResponse(r));
                  });
              })
              .catch((err) => {
                r.status = statusCodes.SERVER_ERROR;
                r.data = {
                  message: "invalid input",
                };
                return res.json(encryptResponse(r));
              });
          })
          .catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
              message: "invalid input",
            };
            return res.json(encryptResponse(r));
          });
      } else {
        r.status = statusCodes.FORBIDDEN;
        r.data = {
          message: "invalid permission",
        };
        return res.json(encryptResponse(r));
      }
    })
    .catch((err) => {
      r.status = statusCodes.SERVER_ERROR;
      r.data = {
        message: "invalid input",
      };
      return res.json(encryptResponse(r));
    });
});

module.exports = router;
