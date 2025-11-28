class ResultsSystem {
    constructor() {
        this.chart = null;
        this.lastUpdate = null;
    }

    async loadResults() {
        try {
            const response = await callGoogleScript('getResults');
            
            if (response.status === 'success') {
                this.displayResults(response);
            } else {
                this.showMessage(response.message);
            }
            
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading results:', error);
            this.showMessage('Error memuat hasil voting: ' + error.message);
        }
    }

    displayResults(data) {
        // Hide message
        document.getElementById('resultsMessage').style.display = 'none';
        
        // Show charts and tables
        document.getElementById('chartContainer').style.display = 'block';
        document.getElementById('tableContainer').style.display = 'block';
        
        // Update status
        document.getElementById('resultsStatus').textContent = 
            `Hasil voting per ${new Date().toLocaleDateString('id-ID')}`;
        
        // Display statistics
        this.displayStats(data.statistics);
        
        // Display chart
        this.renderChart(data.results);
        
        // Display table
        this.renderTable(data.results, data.totalVotes);
    }

    displayStats(stats) {
        const statsContainer = document.getElementById('statsContainer');
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalPemilih}</div>
                <div class="stat-label">Total Pemilih</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalSudahMemilih}</div>
                <div class="stat-label">Sudah Memilih</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalCalon}</div>
                <div class="stat-label">Kandidat</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.participationRate}%</div>
                <div class="stat-label">Tingkat Partisipasi</div>
            </div>
        `;
    }

    renderChart(results) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        const labels = results.map(r => r.nama);
        const data = results.map(r => r.suara);
        const backgroundColors = this.generateColors(results.length);
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jumlah Suara',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = results.reduce((sum, r) => sum + r.suara, 0);
                                const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
                                return `Suara: ${context.parsed.y} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Jumlah Suara'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Nama Kandidat'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    renderTable(results, totalVotes) {
        const tbody = document.getElementById('resultsTableBody');
        
        tbody.innerHTML = results.map((result, index) => {
            const percentage = totalVotes > 0 ? ((result.suara / totalVotes) * 100).toFixed(1) : 0;
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            return `
                <tr>
                    <td>
                        <span class="rank-badge ${rankClass}">${index + 1}</span>
                    </td>
                    <td>${result.nama}</td>
                    <td>
                        <span class="vote-count">${result.suara}</span> suara
                    </td>
                    <td>
                        <span class="vote-percentage">${percentage}%</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    generateColors(count) {
        const colors = [];
        const hueStep = 360 / count;
        
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
        }
        
        return colors;
    }

    showMessage(message) {
        document.getElementById('resultsMessage').style.display = 'block';
        document.getElementById('resultsMessage').innerHTML = `
            <h3>${message}</h3>
            <p>Silakan refresh halaman nanti atau hubungi admin.</p>
        `;
        
        // Hide other elements
        document.getElementById('chartContainer').style.display = 'none';
        document.getElementById('tableContainer').style.display = 'none';
    }

    updateLastUpdateTime() {
        this.lastUpdate = new Date();
        document.getElementById('lastUpdateTime').textContent = 
            this.lastUpdate.toLocaleString('id-ID');
    }
}

// Global results system instance
const resultsSystem = new ResultsSystem();

function loadResults() {
    resultsSystem.loadResults();
}
