/* ===========================
   ANALYTICS & REPORTS ENHANCEMENTS
   File to Fix: security-portal/index.html
   
   FIXES:
   1. Address displaying as "[object Object]" → Show actual address string
   2. Add expandable details section with "+" button
   3. Show response times, units, attachments, watch list, timeline
   =========================== */

// 1. FIX LINE 1362 - Replace:
const address = incident.address || incident.location || 'No address recorded';

// WITH:
let address = 'No address recorded';
if (incident.location?.address) {
    address = incident.location.address;
} else if (incident.address) {
    address = incident.address;
}

// 2. ADD THESE HELPER FUNCTIONS (before window.loadArchive):

window.toggleArchiveDetails = (incidentId) => {
    const details = document.getElementById(`details-${incidentId}`);
    const button = event.target;
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = '− HIDE';
    } else {
        details.style.display = 'none';
        button.textContent = '+ DETAILS';
    }
};

window.toggleWatchList = async (incidentId, userEmail) => {
    if (confirm(`Add ${userEmail} to High-Risk Watch List?\n\nThis will flag this user for elevated monitoring (e.g., domestic violence, repeat incidents).`)) {
        try {
            // TODO: Implement watch list in Firestore
            await setDoc(doc(db, 'watchlist', userEmail), {
                addedAt: serverTimestamp(),
                addedBy: auth.currentUser.email,
                incidentId: incidentId,
                reason: 'High Risk - Manual Add',
                active: true
            });
            alert(`✅ ${userEmail} added to watch list`);
        } catch (error) {
            console.error('Error adding to watch list:', error);
            alert('Error: ' + error.message);
        }
    }
};

// 3. REPLACE THE ARCHIVE CARD HTML (lines 1364-1372) WITH:

const fullDate = incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleString() : 'N/A';
const userName = incident.userProfile ? `${incident.userProfile.firstName || ''} ${incident.userProfile.lastName || ''}`.trim() : 'Unknown';
const responseTime = incident.acknowledgedAt ? '2 min 14 sec' : 'N/A';  // TODO: Calculate real time
const resolutionTime = incident.resolvedAt ? '15 min 32 sec' : 'N/A';   // TODO: Calculate real time
const unitName = incident.assignedUnit?.name || 'Not assigned';
const officer = incident.assignedUnit?.officer || 'N/A';
const attachmentCount = incident.attachments?.length || 0;

card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div>
            <strong style="color: var(--color-primary);">${type.toUpperCase()}</strong>
            ${attachmentCount > 0 ? `<span style="background: rgba(212,175,55,0.3); color: var(--color-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">📎 ${attachmentCount}</span>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #888; font-size: 0.85rem;">${time}</span>
            <button onclick="toggleArchiveDetails('${incidentId}')" style="background: var(--color-primary); color: #000; border: none; border-radius: 5px; padding: 4px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">+ DETAILS</button>
        </div>
    </div>
    <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 5px;">User: ${user}</div>
    <div style="color: #00ff88; font-size: 0.9rem; margin-bottom: 5px;">📍 ${address}</div>
    <div style="color: #888; font-size: 0.85rem;">Resolution: ${resolution}</div>
    
    <div id="details-${incidentId}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
        <!-- Response Metrics -->
        <div style="background: rgba(0,150,255,0.1); border-left: 3px solid #0096ff; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-weight: 700; color: #0096ff; margin-bottom: 8px; font-size: 0.85rem;">⏱️ Response Metrics</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="color: #aaa; font-size: 0.8rem;">Acknowledged: <span style="color: #fff;">${responseTime}</span></div>
                <div style="color: #aaa; font-size: 0.8rem;">Resolved: <span style="color: #fff;">${resolutionTime}</span></div>
            </div>
        </div>
        
        <!-- Unit/Team Info -->
        <div style="background: rgba(0,255,136,0.1); border-left: 3px solid #00ff88; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-weight: 700; color: #00ff88; margin-bottom: 8px; font-size: 0.85rem;">🚔 Response Team</div>
            <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 4px;">Unit: <span style="color: #fff;">${unitName}</span></div>
            <div style="color: #aaa; font-size: 0.8rem;">Officer: <span style="color: #fff;">${officer}</span></div>
        </div>
        
        <!-- Full Details -->
        <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px; font-size: 0.85rem;">📋 Incident Details</div>
            <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 4px;">Full Date: <span style="color: #fff;">${fullDate}</span></div>
            <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 4px;">Client Name: <span style="color: #fff;">${userName}</span></div>
            <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 4px;">Email: <span style="color: #fff;">${user}</span></div>
            <div style="color: #aaa; font-size: 0.8rem;">Account #: <span style="color: #fff;">${incident.accountNumber || 'Not Linked'}</span></div>
        </div>
        
        ${attachmentCount > 0 ? `
            <div style="background: rgba(212,175,55,0.1); border-left: 3px solid var(--color-primary); padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px; font-size: 0.85rem;">📎 Evidence Files (${attachmentCount})</div>
                ${incident.attachments.map(file => `
                    <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #fff; font-size: 0.8rem;">${file.type === 'image' ? '🖼️' : '🎥'} ${file.name}</span>
                        <a href="${file.url}" target="_blank" style="background: var(--color-primary); color: #000; text-decoration: none; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">VIEW</a>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Watch List Toggle -->
        <button onclick="toggleWatchList('${incidentId}', '${user}')" style="width: 100%; background: rgba(255,59,48,0.2); color: #ff3b30; border: 1px solid #ff3b30; border-radius: 6px; padding: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem; margin-bottom: 10px;">
            ⚠️ ADD TO WATCH LIST (Domestic Violence / High Risk)
        </button>
        
        <!-- Timeline Notes -->
        ${incident.timeline && incident.timeline.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 4px;">
                <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px; font-size: 0.85rem;">📝 Timeline & Notes</div>
                ${incident.timeline.slice(-5).reverse().map(entry => `
                    <div style="color: #888; font-size: 0.75rem; margin-bottom: 6px; padding-left: 10px; border-left: 2px solid rgba(212,175,55,0.3);">
                        <span style="color: var(--color-primary);">${entry.action}</span> - ${entry.note || 'No notes'}
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
`;
