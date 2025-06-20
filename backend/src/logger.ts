export const logger = {
  info: (message: string, data: Record<string, any> = {}) =>
    console.log(
      JSON.stringify({
        level: "info",
        message,
        ...data,
        timestamp: new Date().toISOString(),
      })
    ),

  error: (message: string, data: Record<string, any> = {}) =>
    console.error(
      JSON.stringify({
        level: "error",
        message,
        ...data,
        timestamp: new Date().toISOString(),
      })
    ),

  warn: (message: string, data: Record<string, any> = {}) =>
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        ...data,
        timestamp: new Date().toISOString(),
      })
    ),
};
