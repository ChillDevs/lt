import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});