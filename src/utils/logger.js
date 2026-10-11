const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function timestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const logger = {
  info(message) {
    console.log(` ${colors.gray}[${timestamp()}]${colors.reset} ${colors.cyan}[INFO]${colors.reset}    ${message}`);
  },
  success(message) {
    console.log(` ${colors.gray}[${timestamp()}]${colors.reset} ${colors.green}[SUCCESS]${colors.reset} ${message}`);
  },
  warn(message) {
    console.log(` ${colors.gray}[${timestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset}    ${message}`);
  },
  error(message, err) {
    console.log(` ${colors.gray}[${timestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset}   ${message}`);
    if (err && err.stack) {
      console.log(` ${colors.gray}${err.stack}${colors.reset}`);
    } else if (err) {
      console.log(` ${colors.gray}${err}${colors.reset}`);
    }
  },
  cmd(commandName, userTag, location) {
    console.log(` ${colors.gray}[${timestamp()}]${colors.reset} ${colors.magenta}[CMD]${colors.reset}     .${commandName} executed by ${colors.bright}${userTag}${colors.reset} in ${colors.dim}${location}${colors.reset}`);
  },
  banner(client) {
    console.clear();
    console.log('');
    console.log(` ${colors.cyan}  ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ ${colors.reset}`);
    console.log(` ${colors.cyan}  ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗${colors.reset}`);
    console.log(` ${colors.cyan}  ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝${colors.reset}`);
    console.log(` ${colors.cyan}  ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗${colors.reset}`);
    console.log(` ${colors.cyan}  ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║${colors.reset}`);
    console.log(` ${colors.cyan}  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝${colors.reset}`);
    console.log(` ${colors.gray}  ─────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`   ${colors.bright}Bot Account:${colors.reset}  ${colors.green}${client.user.tag}${colors.reset}  ${colors.gray}(ID: ${client.user.id})${colors.reset}`);
    console.log(`   ${colors.bright}Prefix:${colors.reset}       ${colors.white}.${colors.reset}`);
    console.log(`   ${colors.bright}Guilds:${colors.reset}       ${colors.white}${client.guilds.cache.size}${colors.reset}`);
    console.log(`   ${colors.bright}Framework:${colors.reset}    ${colors.white}Discord Components V2${colors.reset}`);
    console.log(`   ${colors.bright}Voice 24/7:${colors.reset}   ${colors.white}${client.voiceManager && client.voiceManager.targetChannelId ? 'Active' : 'Standby'}${colors.reset}`);
    console.log(` ${colors.gray}  ─────────────────────────────────────────────────────────────${colors.reset}`);
    console.log('');
  }
};

module.exports = logger;
