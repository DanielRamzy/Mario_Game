// This script creates a simple icon for the game
// Run this in a browser console or as a standalone HTML file to generate the icon

function createIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 256, 256);
    
    // Mario's head
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(80, 60, 96, 80);
    
    // Mario's face
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(90, 70, 76, 40);
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(100, 80, 10, 10);
    ctx.fillRect(146, 80, 10, 10);
    
    // Mustache
    ctx.fillRect(110, 100, 36, 6);
    
    // Hat
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(80, 60, 96, 15);
    ctx.fillRect(110, 45, 36, 15);
    
    // Body
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(80, 140, 96, 60);
    
    // Overalls
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(80, 150, 96, 50);
    
    // Buttons
    ctx.fillStyle = '#000000';
    ctx.fillRect(100, 170, 8, 8);
    ctx.fillRect(148, 170, 8, 8);
    
    // Convert to data URL
    console.log(canvas.toDataURL());
    
    // For demonstration, we'll create a link to download the image
    const link = document.createElement('a');
    link.download = 'icon.png';
    link.href = canvas.toDataURL();
    link.innerHTML = 'Download Icon';
    document.body.appendChild(link);
}

// Run the function
createIcon();