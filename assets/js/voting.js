class VotingSystem {
    constructor() {
        this.selectedCandidates = new Set();
        this.maxChoices = 5;
        this.candidates = [];
        this.sessionToken = null;
    }

    async initialize() {
        try {
            const voterData = getSession('voterData');
            if (!voterData) {
                throw new Error('Data voter tidak ditemukan');
            }

            this.candidates = voterData.candidates;
            this.maxChoices = voterData.maxChoices;
            this.sessionToken = getSession('voterSession');

            this.updateUI();
            this.renderCandidates();
            this.setupEventListeners();
            
        } catch (error) {
            showAlert('Error memuat data kandidat: ' + error.message);
            console.error('Initialization error:', error);
        }
    }

    renderCandidates() {
        const container = document.getElementById('candidatesContainer');
        
        if (this.candidates.length === 0) {
            container.innerHTML = '<div class="alert alert-warning">Tidak ada kandidat tersedia.</div>';
            return;
        }

        container.innerHTML = this.candidates.map(candidate => `
            <div class="candidate-card ${this.selectedCandidates.has(candidate.nama) ? 'selected' : ''}" 
                 onclick="votingSystem.toggleCandidate('${candidate.nama}')">
                ${this.selectedCandidates.has(candidate.nama) ? 
                    `<div class="selection-badge">${this.getSelectionNumber(candidate.nama)}</div>` : ''}
                <img src="${candidate.fotoUrl || 'assets/images/placeholder.jpg'}" 
                     alt="${candidate.nama}" 
                     class="candidate-image"
                     onerror="this.src='assets/images/placeholder.jpg'">
                <div class="candidate-info">
                    <div class="candidate-name">${candidate.nama}</div>
                    <div class="candidate-school">${candidate.sekolah}</div>
                    <div class="candidate-region">${candidate.kapanewon}</div>
                </div>
            </div>
        `).join('');
    }

    toggleCandidate(candidateName) {
        if (this.selectedCandidates.has(candidateName)) {
            this.selectedCandidates.delete(candidateName);
        } else {
            if (this.selectedCandidates.size >= this.maxChoices) {
                showAlert(`Anda hanya dapat memilih maksimal ${this.maxChoices} kandidat`);
                return;
            }
            this.selectedCandidates.add(candidateName);
        }
        
        this.updateUI();
        this.renderCandidates();
    }

    getSelectionNumber(candidateName) {
        return Array.from(this.selectedCandidates).indexOf(candidateName) + 1;
    }

    updateUI() {
        const currentCount = this.selectedCandidates.size;
        const progressPercent = (currentCount / this.maxChoices) * 100;
        
        document.getElementById('currentCount').textContent = currentCount;
        document.getElementById('maxCount').textContent = this.maxChoices;
        document.getElementById('requiredCount').textContent = this.maxChoices;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
        
        const submitButton = document.getElementById('submitVote');
        submitButton.disabled = currentCount !== this.maxChoices;
        
        // Update progress text
        const progressText = document.getElementById('progressText');
        if (currentCount === 0) {
            progressText.textContent = 'Silakan pilih kandidat di bawah';
            progressText.style.color = '#718096';
        } else if (currentCount < this.maxChoices) {
            progressText.textContent = `Pilih ${this.maxChoices - currentCount} kandidat lagi`;
            progressText.style.color = '#d69e2e';
        } else {
            progressText.textContent = 'Pilihan sudah lengkap! Silakan submit voting.';
            progressText.style.color = '#38a169';
        }
    }

    setupEventListeners() {
        document.getElementById('submitVote').addEventListener('click', () => {
            this.showConfirmation();
        });
    }

    showConfirmation() {
        if (this.selectedCandidates.size !== this.maxChoices) {
            showAlert(`Harus memilih tepat ${this.maxChoices} kandidat`);
            return;
        }

        const selectedList = Array.from(this.selectedCandidates);
        document.getElementById('confirmCount').textContent = selectedList.length;
        document.getElementById('selectedList').innerHTML = selectedList.map(name => 
            `<li>${name}</li>`
        ).join('');
        
        document.getElementById('confirmationModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('confirmationModal').style.display = 'none';
    }

    async submitVote() {
        const button = document.getElementById('submitVote');
        const originalText = showLoading(button);
        
        try {
            const response = await callGoogleScriptPost('submitVote', {
                choices: JSON.stringify(Array.from(this.selectedCandidates)),
                sessionToken: this.sessionToken
            });

            if (response.status === 'success') {
                showAlert('Voting berhasil! Terima kasih atas partisipasi Anda.', 'success');
                clearSession();
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                showAlert(response.message);
                this.closeModal();
            }
        } catch (error) {
            showAlert('Terjadi kesalahan sistem. Silakan coba lagi.');
            console.error('Voting error:', error);
            this.closeModal();
        } finally {
            hideLoading(button, originalText);
        }
    }

    clearSelection() {
        if (this.selectedCandidates.size === 0) {
            return;
        }
        
        if (confirm('Yakin ingin menghapus semua pilihan?')) {
            this.selectedCandidates.clear();
            this.updateUI();
            this.renderCandidates();
            showAlert('Semua pilihan telah direset', 'success');
        }
    }
}

// Global voting system instance
const votingSystem = new VotingSystem();

function initializeVotingPage() {
    votingSystem.initialize();
}

function clearSelection() {
    votingSystem.clearSelection();
}

function closeModal() {
    votingSystem.closeModal();
}

function submitVote() {
    votingSystem.submitVote();
}
