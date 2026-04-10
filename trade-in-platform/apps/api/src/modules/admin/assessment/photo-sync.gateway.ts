import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/api/v1/admin/photo-sync',
  cors: { origin: '*' },
})
export class PhotoSyncGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody() data: { assessmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `assessment:${data.assessmentId}`;
    client.join(room);
    return { event: 'joined', room };
  }

  notifyPhotoUploaded(assessmentId: string, photo: Record<string, unknown>) {
    const room = `assessment:${assessmentId}`;
    this.server.to(room).emit('photo-uploaded', { photo });
  }

  notifySessionExpired(assessmentId: string, sessionId: string) {
    const room = `assessment:${assessmentId}`;
    this.server.to(room).emit('session-expired', { sessionId });
  }
}
