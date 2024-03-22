import { State } from "@stackr/sdk/machine";
import { Chess } from "chess.js";
import { BytesLike, hexlify, solidityPackedKeccak256 } from "ethers";

export class ChessState extends State<string, Chess> {
  constructor(state: string) {
    super(state);
  }

  transformer() {
    return {
      wrap: () => {
        const chessBoard = new Chess(this.state);
        return chessBoard;
      },
      unwrap: (wrappedState: Chess) => {
        return wrappedState.fen();
      },
    };
  }

  getRootHash(): BytesLike {
    return hexlify(solidityPackedKeccak256(["string"], [this.state]));
  }
}
