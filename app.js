// Global variables
        let complaints = JSON.parse(localStorage.getItem('complaints')) || [];
        let isAdminLoggedIn = false;
        let complaintIdCounter = parseInt(localStorage.getItem('complaintIdCounter')) || 1;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            updateAdminStats();
            loadComplaintsTable();
        });

        // Page navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update admin dashboard if admin page is shown
            if (pageId === 'admin' && isAdminLoggedIn) {
                updateAdminStats();
                loadComplaintsTable();
            }
        }

        // Theme toggle
        function toggleTheme() {
            const body = document.body;
            const themeIcon = document.querySelector('.theme-toggle i');
            
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                themeIcon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                themeIcon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
            }
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle i').className = 'fas fa-sun';
        }

        // Submit complaint form
        document.getElementById('complaintForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Submitting...';
            
            // Simulate processing time for better UX
            setTimeout(() => {
                // Get form data
                const formData = {
                    id: `CHD-2024-${String(complaintIdCounter).padStart(3, '0')}`,
                    name: document.getElementById('studentName').value,
                    afn: document.getElementById('afnNumber').value,
                    department: document.getElementById('department').value,
                    category: document.getElementById('category').value,
                    description: document.getElementById('description').value,
                    status: 'Pending',
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString()
                };

                // Add to complaints array
                complaints.push(formData);
                
                // Save to localStorage
                localStorage.setItem('complaints', JSON.stringify(complaints));
                localStorage.setItem('complaintIdCounter', complaintIdCounter + 1);
                
                // Increment counter
                complaintIdCounter++;
                
                // Show success state
                submitBtn.innerHTML = '<i class="fas fa-check" style="margin-right: 0.5rem;"></i>Submitted Successfully!';
                
                // Show enhanced success notification
                showNotification(
                    `🎉 Complaint submitted successfully!\n📋 Your tracking ID: ${formData.id}\n📧 Confirmation sent to your email`, 
                    'success'
                );
                
                // Reset form after delay
                setTimeout(() => {
                    this.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 2000);
                
                // Update admin stats if logged in
                if (isAdminLoggedIn) {
                    updateAdminStats();
                    loadComplaintsTable();
                }
            }, 1500);
        });

        // Track complaint
        function trackComplaint() {
            const trackingId = document.getElementById('trackingId').value.trim();
            const resultDiv = document.getElementById('trackingResult');
            
            if (!trackingId) {
                showNotification('Please enter a complaint ID', 'error');
                return;
            }
            
            // Find complaint
            const complaint = complaints.find(c => c.id === trackingId);
            
            if (complaint) {
                resultDiv.innerHTML = `
                    <div style="background: var(--white); padding: 2rem; border-radius: 0.5rem; box-shadow: var(--shadow);">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Complaint Details</h3>
                        <p><strong>ID:</strong> ${complaint.id}</p>
                        <p><strong>Name:</strong> ${complaint.name}</p>
                        <p><strong>Category:</strong> ${complaint.category}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '')}">${complaint.status}</span></p>
                        <p><strong>Submitted:</strong> ${complaint.date} at ${complaint.time}</p>
                        <p><strong>Description:</strong> ${complaint.description}</p>
                    </div>
                `;
                resultDiv.style.display = 'block';
            } else {
                showNotification('Complaint ID not found', 'error');
                resultDiv.style.display = 'none';
            }
        }

        // Admin login
        function adminLogin() {
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            // Simple hardcoded authentication
            if (username === 'admin' && password === 'admin123') {
                isAdminLoggedIn = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                updateAdminStats();
                loadComplaintsTable();
                showNotification('Admin login successful!', 'success');
            } else {
                showNotification('Invalid credentials', 'error');
            }
        }

        // Update admin statistics
        function updateAdminStats() {
            const total = complaints.length;
            const pending = complaints.filter(c => c.status === 'Pending').length;
            const progress = complaints.filter(c => c.status === 'In Progress').length;
            const resolved = complaints.filter(c => c.status === 'Resolved').length;
            
            document.getElementById('totalComplaints').textContent = total;
            document.getElementById('pendingComplaints').textContent = pending;
            document.getElementById('progressComplaints').textContent = progress;
            document.getElementById('resolvedComplaints').textContent = resolved;
        }

        // Load complaints table
        function loadComplaintsTable() {
            const tbody = document.getElementById('complaintsTableBody');
            tbody.innerHTML = '';
            
            complaints.forEach((complaint, index) => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${complaint.id}</td>
                    <td>${complaint.name}</td>
                    <td>${complaint.category}</td>
                    <td><span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '')}">${complaint.status}</span></td>
                    <td>
                        <select onchange="updateComplaintStatus(${index}, this.value)" style="padding: 0.25rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                            <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                        <button onclick="deleteComplaint(${index})" style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: var(--danger-color); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Delete</button>
                    </td>
                `;
            });
        }

        // Load student's own complaints
        function loadMyComplaints() {
            const afnNumber = document.getElementById('studentAfn').value.trim();
            const resultDiv = document.getElementById('myComplaintsResult');
            
            if (!afnNumber) {
                showNotification('Please enter your AFN number', 'error');
                return;
            }
            
            // Filter complaints by AFN number
            const myComplaints = complaints.filter(c => c.afn === afnNumber);
            
            if (myComplaints.length === 0) {
                resultDiv.innerHTML = `
                    <div style="text-align: center; padding: 2rem; background: var(--white); border-radius: 0.5rem; box-shadow: var(--shadow);">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--text-light);">No Complaints Found</h3>
                        <p style="color: var(--text-light);">You haven't submitted any complaints yet.</p>
                    </div>
                `;
            } else {
                let complaintsHtml = `
                    <div style="background: var(--white); border-radius: 0.5rem; box-shadow: var(--shadow); overflow: hidden;">
                        <div style="background: var(--primary-color); color: white; padding: 1rem;">
                            <h3><i class="fas fa-list"></i> Your Complaints (${myComplaints.length})</h3>
                        </div>
                        <div style="padding: 1rem;">
                `;
                
                myComplaints.forEach(complaint => {
                    complaintsHtml += `
                        <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; background: var(--light-bg);">
                            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                                <div style="flex: 1;">
                                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">
                                        <i class="fas fa-ticket-alt"></i> ${complaint.id}
                                    </h4>
                                    <p style="margin-bottom: 0.5rem;"><strong>Category:</strong> ${complaint.category}</p>
                                    <p style="margin-bottom: 0.5rem;"><strong>Department:</strong> ${complaint.department}</p>
                                </div>
                                <span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '')}">${complaint.status}</span>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <p style="margin-bottom: 0.5rem;"><strong>Description:</strong></p>
                                <p style="background: var(--white); padding: 1rem; border-radius: 0.25rem; border-left: 4px solid var(--primary-color);">
                                    ${complaint.description}
                                </p>
                            </div>
                            
                            <div style="display: flex; justify-content: between; align-items: center; font-size: 0.9rem; color: var(--text-light);">
                                <span><i class="fas fa-calendar"></i> Submitted: ${complaint.date} at ${complaint.time}</span>
                                <button onclick="copyComplaintId('${complaint.id}')" style="padding: 0.25rem 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-copy"></i> Copy ID
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                complaintsHtml += `
                        </div>
                    </div>
                `;
                
                resultDiv.innerHTML = complaintsHtml;
            }
            
            resultDiv.style.display = 'block';
        }

        // Copy complaint ID to clipboard
        function copyComplaintId(complaintId) {
            navigator.clipboard.writeText(complaintId).then(() => {
                showNotification(`Complaint ID ${complaintId} copied to clipboard!`, 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = complaintId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification(`Complaint ID ${complaintId} copied to clipboard!`, 'success');
            });
        }

        // Update complaint status
        function updateComplaintStatus(index, newStatus) {
            complaints[index].status = newStatus;
            localStorage.setItem('complaints', JSON.stringify(complaints));
            updateAdminStats();
            loadComplaintsTable();
            showNotification(`Complaint status updated to ${newStatus}`, 'success');
        }

        // Delete complaint
        function deleteComplaint(index) {
            if (confirm('Are you sure you want to delete this complaint?')) {
                complaints.splice(index, 1);
                localStorage.setItem('complaints', JSON.stringify(complaints));
                updateAdminStats();
                loadComplaintsTable();
                showNotification('Complaint deleted successfully', 'success');
            }
        }

        // Filter complaints
        function filterComplaints() {
            const searchTerm = document.getElementById('searchComplaints').value.toLowerCase();
            const rows = document.querySelectorAll('#complaintsTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');
            const notificationIcon = document.getElementById('notificationIcon');
            
            // Set icon based on type
            if (type === 'success') {
                notificationIcon.className = 'notification-icon fas fa-check-circle';
            } else if (type === 'error') {
                notificationIcon.className = 'notification-icon fas fa-exclamation-circle';
            }
            
            // Handle multiline messages
            notificationText.innerHTML = message.replace(/\n/g, '<br>');
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            // Auto-hide after longer duration for success messages
            const duration = type === 'success' ? 5000 : 3000;
            setTimeout(() => {
                notification.classList.remove('show');
            }, duration);
        }

        // Chatbot functionality
        function toggleChatbot() {
            const chatbotWindow = document.getElementById('chatbotWindow');
            chatbotWindow.classList.toggle('active');
        }

        function handleChatbotInput(event) {
            if (event.key === 'Enter') {
                const input = document.getElementById('chatbotInput');
                const message = input.value.trim();
                
                if (message) {
                    addChatMessage(message, 'user');
                    input.value = '';
                    
                    // Simulate bot response
                    setTimeout(() => {
                        const response = getChatbotResponse(message);
                        addChatMessage(response, 'bot');
                    }, 1000);
                }
            }
        }

        function addChatMessage(message, sender) {
            const messagesContainer = document.getElementById('chatbotMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = message;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function getChatbotResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'Hello! How can I help you with your college-related queries?';
            } else if (lowerMessage.includes('complaint') || lowerMessage.includes('problem')) {
                return 'You can submit a complaint using our Submit Complaint page. You\'ll get a unique tracking ID to monitor progress.';
            } else if (lowerMessage.includes('track') || lowerMessage.includes('status')) {
                return 'To track your complaint, go to the Track Complaint page and enter your complaint ID. You can also view all your complaints in the "My Complaints" section using your AFN number.';
            } else if (lowerMessage.includes('forgot') || lowerMessage.includes('id') || lowerMessage.includes('afn')) {
                return 'If you forgot your complaint ID, go to "My Complaints" page and enter your AFN number to see all your submitted complaints with their IDs.';
            } else if (lowerMessage.includes('hostel')) {
                return 'For hostel-related issues, please submit a complaint under the "Hostel" category. Our team will address it promptly.';
            } else if (lowerMessage.includes('academic')) {
                return 'Academic issues can be reported through our complaint system. Select "Academic Problems" as the category.';
            } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
                return 'You can reach us at: helpdesk@chd.ac.in or call +91-512-123-4567';
            } else {
                return 'I understand you need help. Please use our complaint system for detailed assistance, or contact our support team directly.';
            }
        }

        // Add some sample data for demonstration
        if (complaints.length === 0) {
            const sampleComplaints = [
                {
                    id: 'CHD-2024-001',
                    name: 'John Doe',
                    afn: 'AFN001',
                    department: 'Computer Science',
                    category: 'IT',
                    description: 'WiFi not working in hostel room',
                    status: 'In Progress',
                    date: '2024-01-15',
                    time: '10:30 AM'
                },
                {
                    id: 'CHD-2024-002',
                    name: 'Jane Smith',
                    afn: 'AFN002',
                    department: 'Mechanical',
                    category: 'Hostel',
                    description: 'Water supply issue in Block A',
                    status: 'Resolved',
                    date: '2024-01-14',
                    time: '2:15 PM'
                }
            ];
            
            complaints = sampleComplaints;
            localStorage.setItem('complaints', JSON.stringify(complaints));
            complaintIdCounter = 3;
            localStorage.setItem('complaintIdCounter', complaintIdCounter);
        }