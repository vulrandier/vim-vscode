import { all, optWhitespace, Parser } from 'parsimmon';
import * as vscode from 'vscode';

import { VimState } from '../../state/vimState';
import { StatusBar } from '../../statusBar';
import { ExCommand } from '../../vimscript/exCommand';
import { Register } from '../../register/register';
import { bangParser } from '../../vimscript/parserUtils';

interface IArgDoCommandArguments {
  bang: boolean;
  command: string;
}

//
// Implements :argdo
// Executes a command on all open tabs/buffers
//
export class ArgDoCommand extends ExCommand {
  public static readonly argParser: Parser<ArgDoCommand> = bangParser
    .skip(optWhitespace)
    .chain((bang) => all.map((command) => new ArgDoCommand({ bang, command: command.trim() })));

  public readonly arguments: IArgDoCommandArguments;

  constructor(args: IArgDoCommandArguments) {
    super();
    this.arguments = args;
  }

  async execute(vimState: VimState): Promise<void> {
    const { command, bang } = this.arguments;

    if (!command) {
      StatusBar.setText(vimState, 'argdo: Argument required', true);
      return;
    }

    // For now, only support macro execution
    if (!command.match(/^@[a-zA-Z0-9]$/)) {
      StatusBar.setText(
        vimState,
        `argdo: Only macro execution (@register) is supported. Got: ${command}`,
        true,
      );
      return;
    }

    const register = command.charAt(1).toLowerCase();

    if (!Register.isValidRegister(register)) {
      StatusBar.setText(vimState, `argdo: Invalid register: ${register}`, true);
      return;
    }

    if (!Register.has(register)) {
      StatusBar.setText(vimState, `argdo: Register ${register} is empty`, true);
      return;
    }

    await vimState.bufferOperationManager.executeArgdo(register, false);

    StatusBar.setText(vimState, `argdo: processed macro ${command} for all buffers`);
  }
}
