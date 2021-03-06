module.exports = {
  apps: [{
    name: 'lash',
    script: './app.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-218-4-34.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/lash-server.pem',
      ref: 'origin/master',
      repo: 'git@github.com:cantwait/lash-backend.git',
      path: '/home/ubuntu/lash-backend',
      'post-deploy': 'npm install && npm install db-migrate && npm install db-migrate-mongodb && db-migrate up:all && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
