// export-task.js

function exportChecklist() {
    const printWindow = window.open('', '_blank');
    
    const getTaskRows = (elementId) => {
        const list = document.getElementById(elementId);
        if (!list) return "";
        
        let html = "";
        const items = list.querySelectorAll('.task-item');
        items.forEach(item => {
            const name = item.querySelector('.task-name').textContent;
            const loc = item.querySelector('.task-loc').textContent;
            // Removed the separate span for location to keep it right beside the task
            html += `
                <div class="task-row">
                    <div class="checkbox"></div>
                    <span class="task-text">${name} <span class="loc-inline">${loc}</span></span>
                </div>`;
        });
        return html;
    };

    printWindow.document.write(`
        <html>
        <head>
            <title>Astra-2 Mission Manifest</title>
            <style>
                @page { size: A4; margin: 10mm; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 0; 
                    color: #000; 
                    line-height: 1.2;
                }
                
                .header-block { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    border-bottom: 1.5px solid #000; 
                    margin-bottom: 15px; 
                    padding-bottom: 3px; 
                }
                h1 { margin: 0; letter-spacing: 1px; text-transform: uppercase; font-size: 13px; color: #333; }
                .meta { font-size: 9px; font-weight: bold; }
                
                .container { display: flex; gap: 40px; }
                .column { flex: 1; display: flex; flex-direction: column; }
                
                .section { margin-bottom: 15px; }
                .section-title { 
                    font-size: 11px; font-weight: bold; padding: 3px 8px; margin-bottom: 5px;
                    border-left: 6px solid #333; background: #f4f4f4; text-transform: uppercase;
                }
                
                .speed-h { border-color: #00B3FF; color: #006699; }
                .signal-h { border-color: #00cc00; color: #008000; }
                .hide-h { border-color: #aa00ff; color: #660099; }

                .task-row { 
                    display: flex; align-items: center; 
                    padding: 8px 0; 
                    border-bottom: 1px solid #eee; 
                    font-size: 14px; /* Task and Location same size */
                }
                .checkbox { 
                    width: 16px; height: 16px; border: 1.5px solid #000; 
                    margin-right: 12px; flex-shrink: 0; border-radius: 2px;
                }
                
                /* Location styling: Black, same size, inline */
                .loc-inline { 
                    font-weight: bold; 
                    margin-left: 5px; 
                    color: #000; 
                }
                
                .notes-area {
                    flex-grow: 1;
                    margin-top: 10px; border: 1px solid #eee; padding: 10px; 
                    min-height: 180px; background: #fafafa;
                }

                @media print { 
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header-block">
                <h1>Astra-2 // Mission Manifest</h1>
                <div class="meta">DATE: _________ | ROUND: _________</div>
            </div>
            
            <div class="container">
                <div class="column">
                    <div class="section">
                        <div class="section-title speed-h">[SPEED] Escape Velocity</div>
                        ${getTaskRows('list-speed')}
                    </div>
                    <div class="section">
                        <div class="section-title signal-h">[SIGNAL] Strength</div>
                        ${getTaskRows('list-signal')}
                    </div>
                </div>
                <div class="column">
                    <div class="section">
                        <div class="section-title hide-h">[STEALTH] Emissions Control</div>
                        ${getTaskRows('list-hide')}
                    </div>
                    <div class="notes-area">
                        <span style="font-size: 9px; color: #aaa; font-weight: bold; text-transform: uppercase;">Tactical Observations:</span>
                    </div>
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}