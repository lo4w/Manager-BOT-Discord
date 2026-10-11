# Manager BOT

A high-performance Discord Management Bot built with **Discord Components V2** (`ContainerBuilder`, `TextDisplayBuilder`, `SectionBuilder`, `ActionRowBuilder`), white container layouts, prefix `.`, integrated **24/7 Voice connection**, clean console UI, idle presence, and a 2-second custom profile status rotator.

---

## Command Permissions & Access Guide

### Public Commands (Everyone)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `.ping` | None | Latency and gateway heartbeat statistics |
| `.avatar` | `[@user / ID]` | High-resolution user avatar showcase |
| `.banner` | `[@user / ID]` | High-resolution user profile banner showcase |
| `.userinfo` | `[@user / ID]` | Account and guild membership telemetry *(non-pinging)* |
| `.serverinfo` | None | Guild statistics, channels, counts, and owner |
| `.servericon` | None | Guild icon showcase |
| `.serverbanner`| None | Guild banner showcase |
| `.membercount` | None | Total members, humans, and bot counts |
| `.channelinfo` | `[#channel / ID]` | Channel configuration and metadata |
| `.roles` | None | Complete server role hierarchy *(non-pinging)* |
| `.uptime` | None | Bot continuous uptime telemetry |
| `.botinfo` | None | Bot specs, platform stats, and memory usage |
| `.help` | `[category]` | Interactive Components V2 help menu *(2-minute auto-close)* |

---

### Staff & Admin Commands (Permission Restricted)
| Command | Permission Required | Description |
| :--- | :--- | :--- |
| `.say` | `Administrator` | Broadcast message to channel |
| `.saycon` | `Administrator` | Broadcast inside a white Components V2 container |
| `.poll` | `ManageMessages` | Interactive Components V2 poll with buttons and timer results |
| `.ban` | `BanMembers` | Permanently ban member from the guild |
| `.kick` | `KickMembers` | Kick member from the guild |
| `.timeout` | `ModerateMembers` | Put member in timeout (`10m`, `2h`, `1d`) |
| `.untimeout` | `ModerateMembers` | Remove timeout from member |
| `.clear` | `ManageMessages` | Bulk delete up to 100 messages |
| `.lock` | `ManageChannels` | Lock text channel from sending messages |
| `.unlock` | `ManageChannels` | Unlock text channel |
| `.hide` | `ManageChannels` | Hide channel from standard member view |
| `.unhide` | `ManageChannels` | Reveal channel to standard member view |
| `.slowmode` | `ManageChannels` | Configure channel cooldown rate limit |
| `.nuke` | `ManageChannels` | Clone and reconstruct channel with fresh history |
| `.settopic` | `ManageChannels` | Update channel topic description |
| `.role` | `ManageRoles` | Grant or revoke role from member |
| `.nick` | `ManageNicknames`| Change or reset member nickname |
| `.voice` | `ManageGuild` | Manage 24/7 Voice connection (`status`, `join`, `leave`) |
| `.vmute` | `MuteMembers` | Server mute member in voice channel |
| `.vunmute` | `MuteMembers` | Server unmute member in voice channel |
| `.vkick` | `MoveMembers` | Disconnect member from voice channel |
| `.vdeafen` | `DeafenMembers` | Server deafen member in voice channel |
| `.vundeafen` | `DeafenMembers` | Server undeafen member in voice channel |
| `.vmove` | `MoveMembers` | Move member to another voice channel |
