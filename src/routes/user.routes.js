import { Router } from "express";
import { changeUserPassword, loginUser, logoutUser, refreshAccessToken, registerUser ,getCurrentUser ,updateAccountDetails} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT ,changeUserPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("update-account").patch(verifyJWT ,updateAccountDetails)


export default router