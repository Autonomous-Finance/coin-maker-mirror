import { connect } from "@permaweb/aoconnect"

export const { dryrun: dryrunCache } = connect({
  CU_URL: "https://ao.dataos.so",
})

export const { dryrun } = connect({
  CU_URL: "https://ao.dataos.so",
})
