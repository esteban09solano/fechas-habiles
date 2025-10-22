import { app } from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () =>
  console.log(`Servidor backend corriendo en puerto ${ENV.PORT}`)
);
