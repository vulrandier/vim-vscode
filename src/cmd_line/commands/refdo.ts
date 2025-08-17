import { all, optWhitespace, Parser } from 'parsimmon';

import { VimState } from '../../state/vimState';
import { StatusBar } from '../../statusBar';
import { ExCommand } from '../../vimscript/exCommand';
import { Register } from '../../register/register';
import { bangParser } from '../../vimscript/parserUtils';

interface IRefDoCommandArguments {
  bang: boolean;
  command: string;
}

//
// Implements :refdo
// Like bufdo, executes an operation on all references of the current selection
//
export class RefDoCommand extends ExCommand {
  public static readonly argParser: Parser<RefDoCommand> = bangParser
    .skip(optWhitespace)
    .chain((bang) => all.map((command) => new RefDoCommand({ bang, command: command.trim() })));

  public readonly arguments: IRefDoCommandArguments;

  constructor(args: IRefDoCommandArguments) {
    super();
    this.arguments = args;
  }

  async execute(vimState: VimState): Promise<void> {
    const { command, bang } = this.arguments;

    if (!command) {
      StatusBar.setText(vimState, 'refdo: Argument required', true);
      return;
    }

    // For now, only support macro execution
    if (!command.match(/^@[a-zA-Z0-9]$/)) {
      StatusBar.setText(
        vimState,
        `refdo: Only macro execution (@register) is supported. Got: ${command}`,
        true,
      );
      return;
    }

    const register = command.charAt(1).toLowerCase();

    if (!Register.isValidRegister(register)) {
      StatusBar.setText(vimState, `refdo: Invalid register: ${register}`, true);
      return;
    }

    if (!Register.has(register)) {
      StatusBar.setText(vimState, `refdo: Register ${register} is empty`, true);
      return;
    }

    await vimState.bufferOperationManager.executeRefdo(register, false);

    StatusBar.setText(vimState, `refdo: processed macro ${command} for all buffers`);
  }
}
