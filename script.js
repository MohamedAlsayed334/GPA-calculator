document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const gradeSelect = document.getElementById('gradeSelect');
    const creditSelect = document.getElementById('creditSelect');
    const addCourseBtn = document.getElementById('addCourse');
    const coursesTableBody = document.getElementById('coursesTableBody');
    const currentGpaDisplay = document.getElementById('currentGpa');
    const coursesTable = document.getElementById('coursesTable');
    const noCoursesMessage = document.getElementById('noCoursesMessage');
    const toggleThemeBtn = document.getElementById('toggleTheme');

    // State
    let courses = [];

    // Initialize with dark theme by default
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        updateThemeIcon(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }

    function updateThemeIcon(theme) {
        const icon = toggleThemeBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Add animation class
        toggleThemeBtn.classList.add('theme-change');
        setTimeout(() => {
            toggleThemeBtn.classList.remove('theme-change');
        }, 300);
    }

    // Add ripple effect to buttons
    function addRippleEffect(button) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // Load saved courses from localStorage
    function loadCourses() {
        if (localStorage.getItem('gpaCourses')) {
            courses = JSON.parse(localStorage.getItem('gpaCourses'));
            renderCourses();
            calculateGPA();
        }
    }

    // Save courses to localStorage
    function saveCourses() {
        localStorage.setItem('gpaCourses', JSON.stringify(courses));
    }

    // Render courses table
    function renderCourses() {
        coursesTableBody.innerHTML = '';

        if (courses.length === 0) {
            coursesTable.classList.add('hidden');
            noCoursesMessage.classList.remove('hidden');
            return;
        }

        coursesTable.classList.remove('hidden');
        noCoursesMessage.classList.add('hidden');

        courses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.classList.add('course-row');

            // Find the grade name that matches the grade value
            let gradeName = 'F (0.0)';
            for (let i = 0; i < gradeSelect.options.length; i++) {
                if (parseFloat(gradeSelect.options[i].value) === course.grade) {
                    gradeName = gradeSelect.options[i].text;
                    break;
                }
            }

            row.innerHTML = `
                <td>${gradeName}</td>
                <td>${course.creditHours}</td>
                <td>${course.gradePoints.toFixed(2)}</td>
                <td>
                    <button class="remove-btn ripple" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                        Remove
                    </button>
                </td>
            `;

            coursesTableBody.appendChild(row);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            addRippleEffect(button);
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                courses.splice(index, 1);
                saveCourses();
                renderCourses();
                calculateGPA();
            });
        });
    }

    // Calculate current GPA
    function calculateGPA() {
        if (courses.length === 0) {
            currentGpaDisplay.textContent = '-';
            return;
        }

        const totalGradePoints = courses.reduce((sum, course) => sum + course.gradePoints, 0);
        const totalCreditHours = courses.reduce((sum, course) => sum + course.creditHours, 0);

        const gpa = totalGradePoints / totalCreditHours;
        currentGpaDisplay.textContent = gpa.toFixed(2);

        // Add color based on GPA value
        if (gpa >= 3.5) {
            currentGpaDisplay.style.color = '#4ad66d'; // Green for high GPA
        } else if (gpa >= 2.0) {
            currentGpaDisplay.style.color = '#f8961e'; // Orange for medium GPA
        } else {
            currentGpaDisplay.style.color = '#f72585'; // Red for low GPA
        }
    }

    // Initialize
    initializeTheme();
    loadCourses();

    // Add ripple effect to main button
    addRippleEffect(addCourseBtn);

    // Event listeners
    toggleThemeBtn.addEventListener('click', toggleTheme);

    addCourseBtn.addEventListener('click', function () {
        if (!gradeSelect.value) {
            // Add shake animation to indicate error
            gradeSelect.classList.add('shake');
            setTimeout(() => {
                gradeSelect.classList.remove('shake');
            }, 500);
            return;
        }

        const grade = parseFloat(gradeSelect.value);
        const creditHours = parseInt(creditSelect.value);
        const gradePoints = grade * creditHours;

        const course = {
            grade: grade,
            creditHours: creditHours,
            gradePoints: gradePoints
        };

        courses.push(course);
        saveCourses();
        renderCourses();
        calculateGPA();

        // Reset grade selection
        gradeSelect.value = '';
    });

    // Add animation to select elements when focused
    document.querySelectorAll('.styled-select').forEach(select => {
        select.addEventListener('focus', function () {
            this.parentElement.classList.add('select-focused');
        });

        select.addEventListener('blur', function () {
            this.parentElement.classList.remove('select-focused');
        });
    });

});
//-------------------------------
//-------------------------------
// Detect mobile devices
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Add mobile class if needed
if (isMobile()) {
    document.body.classList.add('mobile-device');
}

// Prevent form zoom on focus (iOS specific)
document.addEventListener('DOMContentLoaded', function () {
    if (isMobile()) {
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('focus', function () {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
            });
        });
    }
});
