import "dotenv/config";
import { RDXServerApp, RootServerService } from "rdx.js";
import { echoService } from "./services/echo.service";

// List of services to register
const services: RootServerService[] = [echoService];

// Initialize the app
const app = new RDXServerApp({
  cmdPrefix: "!",
  services,

  onStarting: () => {
    console.log("🚀 Starting app...");
  },

  onReady: () => {
    console.log("✅ App is ready!");
    console.log(`📝 Command prefix: ${app.getCommandPrefix()}`);
    // console.log(`📦 Loaded ${app.getCommands().size} commands`);
    // console.log(`📡 Loaded ${app.getEvents().size} events`);
    // console.log(`⏰ Loaded ${app.getJobs().size} jobs`);
  },
});
