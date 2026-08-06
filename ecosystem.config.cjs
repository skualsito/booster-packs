const root = __dirname;

module.exports = {
  apps: [
    {
      name: "pullario-web",
      cwd: root,
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "pullario-api",
      cwd: root,
      script: "./server/local-api.mjs",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
