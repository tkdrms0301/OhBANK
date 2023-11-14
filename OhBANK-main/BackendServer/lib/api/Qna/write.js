var express = require("express");
var router = express.Router();
var Model = require("../../../models/index");
var Response = require("../../Response");
var statusCodes = require("../../statusCodes");
var { validateUserToken } = require("../../../middlewares/validateToken");
var {
  encryptResponse,
  decryptRequest,
  decryptAuthRequest,
} = require("../../../middlewares/crypt");

/**
 * QnA file list route
 * This endpoint allows to view list of files of a question
 * @path                             - /api/qna/write
 * @middleware
 * @param title
 * @param content
 * @param writer_id
 * @param file
 * @return                           - isSuccess
 */
router.post("/", decryptAuthRequest, (req, res) => {
  var r = new Response();
  var today = new Date();
  var now =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  if (req.body.file_id_list) {
    Model.qna
      .create({
        title: req.body.title,
        content: req.body.content,
        writer_id: req.user_id,
        write_at: now,
      })
      .then((data) => {
        r.status = statusCodes.SUCCESS;
        r.data = data.id;
        const promises = [];
        for (let i = 0; i < req.body.file_id_list.length; i++) {
          promises.push(
            Model.file.update(
              { qna_id: data.id },
              { where: { id: req.body.file_id_list[i] } }
            )
          );
        }
        // Wait for all file updates to complete
        Promise.all(promises)
          .then(() => {
            return res.json(encryptResponse(r));
          })
          .catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
              message: err.toString(),
            };
            return res.json(encryptResponse(r));
          });
      })
      .catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
          message: err.toString(),
        };
        return res.json(encryptResponse(r));
      });
  } else {
    Model.qna
      .create({
        title: req.body.title,
        content: req.body.content,
        writer_id: req.user_id,
        write_at: now,
      })
      .then((data) => {
        r.status = statusCodes.SUCCESS;
        r.data = data.id;
        return res.json(encryptResponse(r));
      })
      .catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
          message: err.toString(),
        };
        return res.json(encryptResponse(r));
      });
  }
});

module.exports = router;
