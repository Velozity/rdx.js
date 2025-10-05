
import { EchoRequest, EchoResponse, EchoEvent } from "@rdx.js-example/gen-shared";
import { EchoServiceBase } from "@rdx.js-example/gen-server";
import { Client } from "rdx.js";

export class EchoService extends EchoServiceBase {
  async echo(request: EchoRequest, client: Client): Promise<EchoResponse> {
    const echoReply = "Echo server: " + request.message;

    // Broadcast to all other clients
    const event: EchoEvent = { message: echoReply };
    this.broadcastMessage(event, "all", client);

    // Respond to the client that sent the original message
    const response: EchoResponse = { message: echoReply };
    return response;
  }
}

export const echoService = new EchoService();
