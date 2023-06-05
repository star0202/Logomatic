import { Logger } from 'tslog'

export const logger = new Logger({
  name: 'Logomatic',
  prettyLogTemplate:
    '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
  prettyLogTimeZone: 'local',
  minLevel: 3,
})
