import { verifyJWT } from "../middlewares/auth.middleware"

import {getVideoComments,addComment,updateComment,deleteComment} from "../controllers/"
import Router from "express";

const router = Router()
router.use(verifyJWT)

router.routes("/:videoId").get(getVideoComments).post(addComment)
router.routes("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router