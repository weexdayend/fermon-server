import { PrismaClient } from "@prisma/client";
import { logger } from "./logging.js";

export const db = new PrismaClient();  
db.$on('query', (e) => {
  logger.info(e);
});
db.$on('error', (e) => {
  logger.error(e);
});
db.$on('info', (e) => {
  logger.info(e);
});
db.$on('warn', (e) => {
  logger.warn(e);
});