import express from "express";
import practiceRoutes from "./practice.js"
import usersRoutes from "./users.js"
const app = express()

app.use(express.json())

app.use("/api", practiceRoutes)
app.use("/api/users", usersRoutes)

app.listen(5000,()=>{
    console.log("server is running on 5000")
})