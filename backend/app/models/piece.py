class Piece:
    def __init__(self, team, type, value):
        self.team = team
        self.type = type
        self.value = value
        self.has_moved = False
    
    def __repr__(self):
        team_char = 'w' if self.team == 'white' else 'b'
        type_char = self.type[0].upper() if self.type != 'knight' else 'N'
        return f"{team_char}{type_char}"