import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Heart, Map, Key, Search, Eye, 
  Unlock, Lock, ArrowUp, ArrowDown, 
  ArrowLeft, ArrowRight, Package, Home
} from 'lucide-react';

const App = () => {
  // Core game state
  const [gameState, setGameState] = useState({
    player: {
      x: 0,
      y: 0,
      z: 0,
      inventory: [],
      health: 100,
      maxHealth: 100
    },
    worldState: {
      gateLocked: true,
      discoveredRooms: ["0,0,0"],
      revealedItems: {}
    },
    gameLog: [
      { type: 'system', text: 'Welcome to the Eternal Archive...' },
      { type: 'system', text: 'Type HELP for commands, or click the buttons below.' }
    ],
    inputText: '',
    currentRoom: null
  });

  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  // Procedural narrative engine - seeded random generator
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateRoomDescription = (x, y, z) => {
    const roomSeed = x * 374761393 + y * 668265263 + z * 2246822519;
    const rand = (max) => Math.floor(seededRandom(roomSeed) * max);
    
    const adjectives = [
      "Whispering", "Sighing", "Echoing", "Silent", "Mournful",
      "Forgotten", "Ancient", "Timeless", "Eternal", "Decaying"
    ];
    
    const nouns = [
      "Hall", "Chamber", "Gallery", "Vault", "Sanctum",
      "Atrium", "Nexus", "Concourse", "Passage", "Antechamber"
    ];
    
    const sensoryAdjectives = [
      "A faint scent of ozone and old paper lingers",
      "The air tastes of copper and memories",
      "Dust motes dance in the pale light",
      "A deep hum vibrates through the stone",
      "Chill air raises goosebumps on your skin"
    ];
    
    const lighting = [
      "flickering torchlight", "pale bioluminescent fungi", 
      "crackling energy orbs", "dim, sourceless glow",
      "occasional lightning flashes from cracks above"
    ];
    
    const sounds = [
      "distant dripping echoes", "whispers from the walls",
      "the groan of shifting stone", "a low, melodic hum",
      "the skittering of unseen things"
    ];
    
    const details = [
      "Ancient runes are carved into the walls, their meaning lost to time.",
      "Fractured pillars support a ceiling lost in darkness.",
      "A thin layer of ash coats every surface, undisturbed for centuries.",
      "Strange crystals grow from the walls, pulsing with inner light.",
      "Faded tapestries hang in tatters, depicting forgotten histories."
    ];
    
    const roomName = `${adjectives[rand(adjectives.length)]} ${nouns[rand(nouns.length)]}`;
    
    return {
      name: roomName,
      description: `## ${roomName}\n\n` +
        `${sensoryAdjectives[rand(sensoryAdjectives.length)]} in the ${lighting[rand(lighting.length)]}. ` +
        `You hear ${sounds[rand(sounds.length)]} echoing through the space. ` +
        `${details[rand(details.length)]} ` +
        `The architecture suggests a purpose long abandoned, yet the air feels watchful. ` +
        `Shadows cling to the corners like living things, retreating from the light.`
    };
  };

  // Hand-crafted rooms
  const getRoomData = (x, y, z) => {
    const coordKey = `${x},${y},${z}`;
    
    // Hand-crafted rooms
    if (coordKey === "0,0,0") {
      return {
        name: "The Obsidian Cell",
        description: "## The Obsidian Cell\n\n" +
          "You stand in a perfect cube of polished obsidian. Your reflection stares back from every surface, " +
          "multiplied into infinity. The air is cold and still, smelling of volcanic glass and old tears. " +
          "Weeping walls glisten with moisture that never quite falls, catching the light from a single shaft far above. " +
          "The silence here is absolute, broken only by the pounding of your own heart. " +
          "This place feels less like a prison and more like a preserved moment, frozen in black glass.",
        hiddenItems: gameState.worldState.revealedItems[coordKey]?.includes("Iron Key") ? [] : ["Iron Key"],
        visibleItems: []
      };
    }
    
    if (coordKey === "0,1,0") {
      return {
        name: "The Grand Chasm",
        description: "## The Grand Chasm\n\n" +
          "A vast rift splits the world before you, so deep the bottom vanishes into violet mist. " +
          "Stone bridges, delicate as spiderwebs, span the abyss in intricate patterns. " +
          "The air here smells of lightning and ozone, tasting electric on your tongue. " +
          "Far below, strange lights pulse in the depths, their rhythms syncopated and alien. " +
          "Echoes take seconds to return, transformed by the chasm's acoustics into ghostly choirs.",
        connections: [
          { x: 0, y: 1, z: 1, description: "A shimmering portal leads to the Archive" },
          { x: 0, y: 2, z: 0, description: "A massive gate bars the way forward" }
        ],
        hiddenItems: [],
        visibleItems: []
      };
    }
    
    if (coordKey === "0,1,1") {
      return {
        name: "The Infinite Archive",
        description: "## The Infinite Archive\n\n" +
          "Shelves stretch into impossible distances, curving upward to form a sphere of knowledge. " +
          "Books here are bound in strange materials: dragonhide, memory-crystal, solidified time. " +
          "The scent of old paper, ink, and something like star-dust fills the air. " +
          "Whispers escape from between pages, telling fragments of stories in dead languages. " +
          "Ladders without end scale the shelves, moving of their own accord to fetch volumes for unseen readers.",
        hiddenItems: [],
        visibleItems: ["Map of the Labyrinth"]
      };
    }
    
    if (coordKey === "0,2,0") {
      const isLocked = gameState.worldState.gateLocked;
      return {
        name: "The Great Gate",
        description: "## The Great Gate\n\n" +
          "Towering five hundred feet high, the Gate is carved from a single piece of white stone that glows with inner light. " +
          "Its surface shows the entire history of the labyrinth in intricate bas-relief, scenes moving and evolving as you watch. " +
          "The air hums with ancient power, vibrating through your bones. " +
          (isLocked 
            ? "Twin crescent-shaped keyholes glow with amber light, waiting for their counterparts. The way forward is sealed."
            : "The gate stands open, revealing a corridor of pure light beyond. The mechanisms whir with satisfaction, their task complete."),
        hiddenItems: [],
        visibleItems: []
      };
    }
    
    // Procedurally generated rooms for unexplored areas
    const generated = generateRoomDescription(x, y, z);
    return {
      ...generated,
      hiddenItems: [],
      visibleItems: []
    };
  };

  // Update current room when coordinates change
  useEffect(() => {
    const { x, y, z } = gameState.player;
    const coordKey = `${x},${y},${z}`;
    
    // Add to discovered rooms if new
    if (!gameState.worldState.discoveredRooms.includes(coordKey)) {
      setGameState(prev => ({
        ...prev,
        worldState: {
          ...prev.worldState,
          discoveredRooms: [...prev.worldState.discoveredRooms, coordKey]
        }
      }));
    }
    
    const room = getRoomData(x, y, z);
    setGameState(prev => ({
      ...prev,
      currentRoom: room
    }));
    
    // Auto-LOOK when entering new room
    addToLog('system', `\n${room.description}`);
    
  }, [gameState.player.x, gameState.player.y, gameState.player.z]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.gameLog]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addToLog = (type, text) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog, { type, text }]
    }));
  };

  const handleCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    const { x, y, z } = gameState.player;
    const coordKey = `${x},${y},${z}`;
    const room = gameState.currentRoom;
    
    addToLog('command', `> ${command}`);
    
    // Navigation commands
    if (cmd === 'n' || cmd === 'north') {
      movePlayer(0, 1, 0);
      return;
    }
    if (cmd === 's' || cmd === 'south') {
      movePlayer(0, -1, 0);
      return;
    }
    if (cmd === 'e' || cmd === 'east') {
      movePlayer(1, 0, 0);
      return;
    }
    if (cmd === 'w' || cmd === 'west') {
      movePlayer(-1, 0, 0);
      return;
    }
    if (cmd === 'u' || cmd === 'up') {
      movePlayer(0, 0, 1);
      return;
    }
    if (cmd === 'd' || cmd === 'down') {
      movePlayer(0, 0, -1);
      return;
    }
    
    // Action commands
    if (cmd === 'look' || cmd === 'l') {
      addToLog('system', `\n${room.description}`);
      return;
    }
    
    if (cmd === 'search') {
      handleSearch();
      return;
    }
    
    if (cmd === 'inventory' || cmd === 'i') {
      if (gameState.player.inventory.length === 0) {
        addToLog('system', 'You are carrying nothing.');
      } else {
        addToLog('system', `Inventory: ${gameState.player.inventory.join(', ')}`);
      }
      return;
    }
    
    if (cmd === 'health' || cmd === 'hp') {
      addToLog('system', `Health: ${gameState.player.health}/${gameState.player.maxHealth}`);
      return;
    }
    
    if (cmd === 'help' || cmd === '?') {
      addToLog('system', 
        '## Available Commands:\n' +
        '- LOOK/L: Describe current room\n' +
        '- SEARCH: Search for hidden items\n' +
        '- TAKE [item]: Pick up an item\n' +
        '- INVENTORY/I: Check carried items\n' +
        '- UNLOCK: Attempt to unlock gates\n' +
        '- N/S/E/W/U/D: Move\n' +
        '- HELP/?: This message\n\n' +
        'You can also click the buttons below.'
      );
      return;
    }
    
    if (cmd.startsWith('take ')) {
      const item = command.substring(5).trim();
      handleTake(item);
      return;
    }
    
    if (cmd === 'unlock') {
      handleUnlock();
      return;
    }
    
    if (cmd === 'map') {
      const hasMap = gameState.player.inventory.includes('Map of the Labyrinth');
      if (hasMap) {
        addToLog('system', 
          '## Map of the Labyrinth\n\n' +
          '          [The Great Gate]\n' +
          '                (0,2,0)\n' +
          '                   |\n' +
          '          [Grand Chasm]\n' +
          '          (0,1,0)\n' +
          '           /       \\\n' +
          '  [Archive]   [Obsidian Cell]\n' +
          '  (0,1,1)       (0,0,0)\n\n' +
          'The map shows strange geometries - rooms that should not connect do, and distances seem to fold.'
        );
      } else {
        addToLog('system', 'You need a map to use this command. Perhaps search the Archive?');
      }
      return;
    }
    
    // Unknown command
    addToLog('system', `Unknown command: "${command}". Type HELP for available commands.`);
  };

  const movePlayer = (dx, dy, dz) => {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    const newZ = gameState.player.z + dz;
    
    // Special case: The Great Gate
    if (newX === 0 && newY === 2 && newZ === 0 && gameState.worldState.gateLocked) {
      addToLog('system', 'The Great Gate is locked. You need to find a way to open it.');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        x: newX,
        y: newY,
        z: newZ
      }
    }));
    
    const direction = 
      dx === 1 ? 'east' : dx === -1 ? 'west' :
      dy === 1 ? 'north' : dy === -1 ? 'south' :
      dz === 1 ? 'up' : 'down';
    
    addToLog('system', `You move ${direction}.`);
  };

  const handleSearch = () => {
    const { x, y, z } = gameState.player;
    const coordKey = `${x},${y},${z}`;
    const room = gameState.currentRoom;
    
    if (room.hiddenItems && room.hiddenItems.length > 0) {
      const item = room.hiddenItems[0];
      
      // Reveal the item
      setGameState(prev => ({
        ...prev,
        worldState: {
          ...prev.worldState,
          revealedItems: {
            ...prev.worldState.revealedItems,
            [coordKey]: [...(prev.worldState.revealedItems[coordKey] || []), item]
          }
        }
      }));
      
      addToLog('system', `You found something! ${item} is here.`);
      addToLog('system', `(Use TAKE ${item} to pick it up)`);
      
    } else if (room.visibleItems && room.visibleItems.length > 0) {
      addToLog('system', `You can see: ${room.visibleItems.join(', ')}`);
    } else {
      addToLog('system', 'You search carefully, but find nothing of interest.');
    }
  };

  const handleTake = (itemName) => {
    const { x, y, z } = gameState.player;
    const coordKey = `${x},${y},${z}`;
    const room = gameState.currentRoom;
    
    // Check visible items
    const isVisible = room.visibleItems && room.visibleItems.includes(itemName);
    
    // Check revealed hidden items
    const isRevealed = gameState.worldState.revealedItems[coordKey]?.includes(itemName);
    
    if (isVisible || isRevealed) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: [...prev.player.inventory, itemName]
        }
      }));
      
      // Remove from room
      if (isRevealed) {
        setGameState(prev => ({
          ...prev,
          worldState: {
            ...prev.worldState,
            revealedItems: {
              ...prev.worldState.revealedItems,
              [coordKey]: prev.worldState.revealedItems[coordKey].filter(i => i !== itemName)
            }
          }
        }));
      }
      
      addToLog('system', `You take the ${itemName}.`);
    } else {
      addToLog('system', `You don't see "${itemName}" here. Try SEARCHing first.`);
    }
  };

  const handleUnlock = () => {
    const { x, y, z } = gameState.player;
    
    if (x === 0 && y === 2 && z === 0) {
      if (gameState.player.inventory.includes('Iron Key')) {
        setGameState(prev => ({
          ...prev,
          worldState: {
            ...prev.worldState,
            gateLocked: false
          }
        }));
        
        addToLog('system', 
          '## The Great Gate Unlocks\n\n' +
          'The Iron Key fits perfectly. With a sound like thunder and breaking glass, ' +
          'the massive gate swings inward. Light pours forth, blinding in its intensity. ' +
          'The way forward is open.'
        );
      } else {
        addToLog('system', 'The gate requires a key. You sense it must be somewhere in this labyrinth...');
      }
    } else {
      addToLog('system', 'There\'s nothing here to unlock.');
    }
  };

  const handleInputChange = (e) => {
    setGameState(prev => ({
      ...prev,
      inputText: e.target.value
    }));
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && gameState.inputText.trim()) {
      handleCommand(gameState.inputText);
      setGameState(prev => ({
        ...prev,
        inputText: ''
      }));
    }
  };

  const renderLogEntry = (entry, index) => {
    const isCommand = entry.type === 'command';
    const isSystem = entry.type === 'system';
    
    return (
      <div 
        key={index}
        className={`mb-2 ${isCommand ? 'text-amber-300' : 'text-emerald-400'} whitespace-pre-wrap leading-relaxed`}
      >
        {entry.text.split('\\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < entry.text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] p-2 md:p-4 font-mono">
      {/* HUD */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-black/50 border border-[#00ff41]/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Compass size={16} className="text-amber-300" />
              <span className="text-gray-400">Location:</span>
              <span className="font-bold">{gameState.currentRoom?.name || 'Unknown'}</span>
            </div>
            <div className="text-xs mt-1 text-gray-500">
              Coordinates: [{gameState.player.x}, {gameState.player.y}, {gameState.player.z}]
            </div>
          </div>
          
          <div className="bg-black/50 border border-[#00ff41]/30 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                <span className="text-gray-400">Health</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{gameState.player.health}/{gameState.player.maxHealth}</div>
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 border border-[#00ff41]/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-amber-300" />
              <span className="text-gray-400">Inventory:</span>
              <span className="font-bold">{gameState.player.inventory.length} items</span>
            </div>
            <div className="text-xs mt-1 text-gray-500 truncate">
              {gameState.player.inventory.length > 0 
                ? gameState.player.inventory.join(', ')
                : 'Empty'
              }
            </div>
          </div>
        </div>
        
        {/* Game Log */}
        <div className="bg-black/70 border border-[#00ff41]/20 rounded-lg p-4 mb-4 h-[50vh] overflow-y-auto">
          {gameState.gameLog.map(renderLogEntry)}
          <div ref={logEndRef} />
        </div>
        
        {/* Command Input */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-300 animate-pulse">▶</span>
            <span className="text-gray-400">Enter command:</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={gameState.inputText}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-emerald-300 font-mono focus:outline-none focus:border-[#00ff41]/60 focus:ring-1 focus:ring-[#00ff41]/30"
            placeholder="Type HELP for commands, or press Enter..."
          />
        </div>
        
        {/* Action Buttons Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {/* Navigation */}
          <button
            onClick={() => handleCommand('N')}
            className="col-span-2 md:col-span-1 bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
          >
            <ArrowUp size={20} />
            <span className="text-xs">NORTH</span>
          </button>
          
          <div className="col-span-4 md:col-span-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCommand('W')}
              className="bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <ArrowLeft size={20} />
              <span className="text-xs">WEST</span>
            </button>
            
            <button
              onClick={() => handleCommand('LOOK')}
              className="bg-black/50 border border-amber-300/30 hover:bg-amber-300/10 hover:border-amber-300/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <Eye size={20} className="text-amber-300" />
              <span className="text-xs">LOOK</span>
            </button>
            
            <button
              onClick={() => handleCommand('E')}
              className="bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <ArrowRight size={20} />
              <span className="text-xs">EAST</span>
            </button>
            
            <button
              onClick={() => handleCommand('U')}
              className="bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <ArrowUp size={20} />
              <span className="text-xs">UP</span>
            </button>
            
            <button
              onClick={() => handleCommand('SEARCH')}
              className="bg-black/50 border border-amber-300/30 hover:bg-amber-300/10 hover:border-amber-300/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <Search size={20} className="text-amber-300" />
              <span className="text-xs">SEARCH</span>
            </button>
            
            <button
              onClick={() => handleCommand('D')}
              className="bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
            >
              <ArrowDown size={20} />
              <span className="text-xs">DOWN</span>
            </button>
          </div>
          
          <button
            onClick={() => handleCommand('S')}
            className="col-span-2 md:col-span-1 bg-black/50 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
          >
            <ArrowDown size={20} />
            <span className="text-xs">SOUTH</span>
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleCommand('INVENTORY')}
            className="bg-black/50 border border-amber-300/30 hover:bg-amber-300/10 hover:border-amber-300/60 p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Package size={18} className="text-amber-300" />
            <span>INVENTORY</span>
          </button>
          
          <button
            onClick={() => handleCommand('TAKE')}
            className="bg-black/50 border border-amber-300/30 hover:bg-amber-300/10 hover:border-amber-300/60 p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Key size={18} className="text-amber-300" />
            <span>TAKE ITEM</span>
          </button>
          
          <button
            onClick={handleUnlock}
            className={`border p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              gameState.worldState.gateLocked
                ? 'border-red-400/30 hover:bg-red-400/10 hover:border-red-400/60'
                : 'border-emerald-400/30 hover:bg-emerald-400/10 hover:border-emerald-400/60'
            }`}
          >
            {gameState.worldState.gateLocked ? (
              <Lock size={18} className="text-red-400" />
            ) : (
              <Unlock size={18} className="text-emerald-400" />
            )}
            <span>UNLOCK</span>
          </button>
          
          <button
            onClick={() => handleCommand('MAP')}
            className="bg-black/50 border border-amber-300/30 hover:bg-amber-300/10 hover:border-amber-300/60 p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Map size={18} className="text-amber-300" />
            <span>MAP</span>
          </button>
        </div>
        
        {/* Game Status */}
        <div className="mt-6 pt-4 border-t border-[#00ff41]/10 text-sm text-gray-500">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Discovered Rooms: {gameState.worldState.discoveredRooms.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Key size={14} className="text-amber-300" />
              <span>Key Found: {gameState.player.inventory.includes('Iron Key') ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className={gameState.worldState.gateLocked ? 'text-red-400' : 'text-emerald-400'} />
              <span>Great Gate: {gameState.worldState.gateLocked ? 'LOCKED' : 'UNLOCKED'}</span>
            </div>
          </div>
          <div className="mt-2 text-xs">
            Tip: Search The Obsidian Cell (0,0,0) thoroughly. The Archive (0,1,1) contains useful items.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
