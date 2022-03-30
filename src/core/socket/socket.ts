import { Server, Socket } from 'socket.io'
import logger from '../service/logger.service'

const EVENTS = {
  CONNECTION: 'connection',
  CLIENT: {
    CREATE_ROOM: 'CREATE_ROOM',
    SEND_ROOM_MESSAGE: 'SEND_ROOM_MESSAGE',
    JOIN_ROOM: 'JOIN_ROOM',
  },
  SERVER: {
    ROOMS: 'ROOMS',
    JOINED_ROOM: 'JOINED_ROOM',
    ROOM_MESSAGE: 'ROOM_MESSAGE',
  },
}

const rooms: Record<string, { name: string }> = {}

function socket({ io }: { io: Server }) {
  logger.info('Socket.io is running')

  /**
   * User creates a new room
   */
  io.on(EVENTS.CONNECTION, async (socket: Socket) => {
    logger.info(`Socket.io user connected. Socket ID: ${socket.id}`)

    socket.on(EVENTS.CLIENT.CREATE_ROOM, (userIds: string[]) => {
      const sortedUserIds = userIds.sort()
      const roomName = sortedUserIds.join('::')
      rooms[roomName] = { name: roomName }

      socket.join(roomName)

      socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms)

      socket.emit(EVENTS.SERVER.ROOMS, rooms)
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomName)
    })

    /**
     * User sends a message to a room
     */
    socket.on(
      EVENTS.CLIENT.SEND_ROOM_MESSAGE,
      ({ roomName, message, userId }: { roomName: string; message: string; userId: string }) => {
        socket.to(roomName).emit(EVENTS.SERVER.ROOM_MESSAGE, { message, userId, time: new Date().toISOString() })
      },
    )

    /**
     * User joins a room
     */
    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomName: string) => {
      socket.join(roomName)
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomName)
      // load past messages for user
    })
  })
}

export default socket
