#!/usr/bin/env node
import { registerHttpCommands } from "@buildxn/http-cli";
import { Command } from "commander";
import { getVersion } from "./get-version.ts";

const program = new Command().name("bxn").version(getVersion());

registerHttpCommands(program.command("http"))

program.parseAsync(process.argv);
