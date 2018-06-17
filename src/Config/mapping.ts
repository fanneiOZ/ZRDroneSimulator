export const  mapDirection = {
    'EAST': 0,
    'NORTH': 1,
    'WEST': 2,
    'SOUTH': 3,
};

export const keyDirection = {
    '-3': 'NORTH',
    '-2': 'WEST',
    '-1': 'SOUTH',
    '0': 'EAST',
    '1': 'NORTH',
    '2': 'WEST',
    '3': 'SOUTH'   
}

export const mapRotation = {
    'LEFT': 1,
    'RIGHT': -1
};

export const enum tableDimension {
    Width = 5,
    Height = 5
};

export const enum requestResult {
    Remoted = 2,
    Succeeded = 1,
    Failed = 0,
    Started = -1,
    ListPushed = -2,
    RemoteDisconnected = -3
}

export const enum responseMessage {
    MoveSucceeded       = 'Drone moved to %direction%.',
    MoveFailed          = 'Drone is at the %direction% edge. Unable to move forward.',
    MoveRemoted         = 'Drone remoted moving to %direction% by %remoter%',
    Rotated             = 'Drone rotated to %rotation% toward the %direction%.',
    RotateRemoted       = 'Drone remoted rotating to %rotation% toward the %direction% by %remoter%',
    PlaceSucceeded      = 'Drone placed at %position% heading to %direction%.',
    PlaceFailed         = 'Unable to place the drone. It must be placed on the table.',
    PlaceRemoted        = 'Drone remoted placing at %position% heading to %direction% by %remoter%.',
    ConnectionClosed    = 'Connection from %s closed.',
    InvalidCommand      = 'Invalid command. Please try with LEFT, RIGHT, MOVE, PLACE',
    ArgumentsIncomplete = 'Required command argument not found.',
    ProcessingError     = 'Command parsing error. Please check request object.',
    RemoteDisconnected = 'Remoted drone session disconnected.',
    ConnectedClientsPushed = 'List of connected clients pushed.'
}

export const enum replaceKeyword {
    direction = '%direction%',
    position = '%position%',
    rotation = '%rotation%',
    remoter = '%remoter%'
}

export const enum droneCommand {
    createDrone = 'CREATE',
    rotateToLeft = 'LEFT',
    rotateToRight = 'RIGHT',
    moveForward = 'MOVE',
    placeAt = 'PLACE',
    repeatCommand = 'REPEAT',
    requestRemote = 'REMOTE'
}

