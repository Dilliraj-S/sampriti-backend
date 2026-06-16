// PM2 ecosystem config — used by Hostinger Managed Node.js
// Upload this file to the backend root on the server

module.exports = {
  apps: [
    {
      name: 'sampriti-backend',
      script: 'src/app.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 5000,
    },
  ],
};
