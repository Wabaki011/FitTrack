// public/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("app.js Step 2: Implement Login Action");

    const app = document.getElementById('app');

    const state = {
        user: null,
        dashboardData: null,
        currentView: 'dashboard', // Added state for current view
        waterIntake: 0,
        prs: {
            squat: 0,
            bench: 0,
            deadlift: 0
        },
        workoutLog: [], // Stores all logged workouts
        tempWorkoutSets: [], // Temporarily holds sets for the current workout session
        workoutDictionary: [], // Holds the workout dictionary data
        foodDictionary: [], // Holds the food dictionary data
        nutritionGoals: {
            targetCalories: 2500,
            targetProtein: 150,
            targetCarbs: 300,
            targetFats: 70,
            currentCalories: 0,
            currentProtein: 0,
            currentCarbs: 0,
            currentFats: 0
        },
        meals: [], // To store logged meals
        workoutPlans: [], // To store all available workout plans
        selectedPlan: null // To store the currently viewed workout plan
    };

    // Utility function to get workout summary
    const getWorkoutSummary = (workoutLog) => {
        const summary = {
            lastWorkout: null,
            maxLifts: {}
        };

        if (workoutLog.length === 0) {
            return summary;
        }

        // Get last workout
        summary.lastWorkout = workoutLog[workoutLog.length - 1];

        // Get max lifts for each exercise/muscle group
        workoutLog.forEach(log => {
            const key = `${log.exercise} (${log.muscleGroup})`;
            if (!summary.maxLifts[key] || log.weight * log.reps > summary.maxLifts[key].weight * summary.maxLifts[key].reps) {
                summary.maxLifts[key] = {
                    weight: log.weight,
                    reps: log.reps
                };
            }
        });

        return summary;
    };

    const templates = {
        loginPage: () => `
            <div class="container vh-100 d-flex justify-content-center align-items-center">
                <div class="row w-100">
                    <div class="col-lg-6 d-none d-lg-block"><img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" class="img-fluid"></div>
                    <div class="col-lg-5 col-md-8 mx-auto">
                        <div class="card shadow-lg border-0 p-4">
                            <div class="card-body">
                                <h1 class="card-title text-center font-weight-bold mb-2">Welcome Back!</h1>
                                <p class="card-text text-center text-muted mb-4">Log in to continue.</p>
                                <form id="login-form">
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Username</label>
                                        <input type="text" id="username" class="form-control form-control-lg" value="Timothy" required>
                                    </div>
                                    <div class="mb-4">
                                        <label for="password" class="form-label">Password</label>
                                        <input type="password" id="password" class="form-control form-control-lg" value="admin" required>
                                    </div>
                                    <div class="d-grid"><button type="submit" class="btn btn-primary btn-lg">Login</button></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        layout: (content, user) => `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#" data-view="dashboard" style="font-weight: 700;"><i class="bi bi-heart-pulse-fill me-2 text-primary"></i>FitTrack</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'dashboard' ? 'active' : ''}" href="#" data-view="dashboard">Dashboard</a></li>
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'prs' ? 'active' : ''}" href="#" data-view="prs">Personal Records</a></li>
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'foodProgram' ? 'active' : ''}" href="#" data-view="foodProgram">Food Program</a></li>
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'workoutPlan' ? 'active' : ''}" href="#" data-view="workoutPlan">Workout Plan</a></li>
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'waterTracking' ? 'active' : ''}" href="#" data-view="waterTracking">Water Tracking</a></li>
                            <li class="nav-item"><a class="nav-link ${state.currentView === 'workoutDictionary' ? 'active' : ''}" href="#" data-view="workoutDictionary">Workout Dictionary</a></li>
                        </ul>
                        <div class="d-flex align-items-center">
                            <span class="navbar-text me-3">Welcome, <strong>${user.fullName}</strong>!</span>
                            <button id="logout-btn" class="btn btn-outline-primary">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>
            <main class="py-4">
                ${content}
            </main>
            <!-- Modals (placed outside main content for Bootstrap functionality) -->
            <!-- PR Update Modal -->
            <div class="modal fade" id="prModal" tabindex="-1" aria-labelledby="prModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="prModalLabel">Update Personal Records</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="pr-form">
                                <div class="mb-3">
                                    <label for="squat-pr" class="form-label">Squat (kg)</label>
                                    <input type="number" class="form-control" id="squat-pr" value="${state.prs.squat}">
                                </div>
                                <div class="mb-3">
                                    <label for="bench-pr" class="form-label">Bench (kg)</label>
                                    <input type="number" class="form-control" id="bench-pr" value="${state.prs.bench}">
                                </div>
                                <div class="mb-3">
                                    <label for="deadlift-pr" class="form-label">Deadlift (kg)</label>
                                    <input type="number" class="form-control" id="deadlift-pr" value="${state.prs.deadlift}">
                                </div>
                                <button type="submit" class="btn btn-primary">Save PRs</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Workout Log Modal -->
            <div class="modal fade" id="workoutLogModal" tabindex="-1" aria-labelledby="workoutLogModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="workoutLogModalLabel">Log Your Workout</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="nav nav-tabs" id="workoutTabs" role="tablist">
                                <li class="nav-item" role="presentation"><button class="nav-link active" id="chest-tab" data-bs-toggle="tab" data-bs-target="#chest" type="button" role="tab" aria-controls="chest" aria-selected="true">Chest</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="back-tab" data-bs-toggle="tab" data-bs-target="#back" type="button" role="tab" aria-controls="back" aria-selected="false">Back</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="legs-tab" data-bs-toggle="tab" data-bs-target="#legs" type="button" role="tab" aria-controls="legs" aria-selected="false">Legs</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="biceps-tab" data-bs-toggle="tab" data-bs-target="#biceps" type="button" role="tab" aria-controls="biceps" aria-selected="false">Biceps</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="triceps-tab" data-bs-toggle="tab" data-bs-target="#triceps" type="button" role="tab" aria-controls="triceps" aria-selected="false">Triceps</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="shoulder-tab" data-bs-toggle="tab" data-bs-target="#shoulder" type="button" role="tab" aria-controls="shoulder" aria-selected="false">Shoulder</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="abs-tab" data-bs-toggle="tab" data-bs-target="#abs" type="button" role="tab" aria-controls="abs" aria-selected="false">Abs</button></li>
                            </ul>
                            <div class="tab-content" id="workoutTabsContent">
                                ${templates.workoutTabContent('chest', 'Bench Press')}
                                ${templates.workoutTabContent('back', 'Deadlift')}
                                ${templates.workoutTabContent('legs', 'Squat')}
                                ${templates.workoutTabContent('biceps', 'Bicep Curl')}
                                ${templates.workoutTabContent('triceps', 'Tricep Extension')}
                                ${templates.workoutTabContent('shoulder', 'Overhead Press')}
                                ${templates.workoutTabContent('abs', 'Crunches')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="save-workout-session-btn">Save Workout Session</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nutrition Goal Modal -->
            <div class="modal fade" id="nutritionGoalModal" tabindex="-1" aria-labelledby="nutritionGoalModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="nutritionGoalModalLabel">Set Nutrition Goals</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="nutrition-goal-form">
                                <div class="mb-3">
                                    <label for="target-calories" class="form-label">Target Calories</label>
                                    <input type="number" class="form-control" id="target-calories" value="${state.nutritionGoals.targetCalories}">
                                </div>
                                <div class="mb-3">
                                    <label for="target-protein" class="form-label">Target Protein (g)</label>
                                    <input type="number" class="form-control" id="target-protein" value="${state.nutritionGoals.targetProtein}">
                                </div>
                                <div class="mb-3">
                                    <label for="target-carbs" class="form-label">Target Carbs (g)</label>
                                    <input type="number" class="form-control" id="target-carbs" value="${state.nutritionGoals.targetCarbs}">
                                </div>
                                <div class="mb-3">
                                    <label for="target-fats" class="form-label">Target Fats (g)</label>
                                    <input type="number" class="form-control" id="target-fats" value="${state.nutritionGoals.targetFats}">
                                </div>
                                <button type="submit" class="btn btn-primary">Save Goals</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Meal Modal -->
            <div class="modal fade" id="addMealModal" tabindex="-1" aria-labelledby="addMealModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addMealModalLabel">Add Meal</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-meal-form">
                                <div class="mb-3">
                                    <label for="meal-name" class="form-label">Food / Meal Name</label>
                                    <input type="text" class="form-control" id="meal-name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="meal-calories" class="form-label">Calories</label>
                                    <input type="number" class="form-control" id="meal-calories" required>
                                </div>
                                <div class="mb-3">
                                    <label for="meal-protein" class="form-label">Protein (g)</label>
                                    <input type="number" class="form-control" id="meal-protein" required>
                                </div>
                                <div class="mb-3">
                                    <label for="meal-carbs" class="form-label">Carbs (g)</label>
                                    <input type="number" class="form-control" id="meal-carbs" required>
                                </div>
                                <div class="mb-3">
                                    <label for="meal-fats" class="form-label">Fats (g)</label>
                                    <input type="number" class="form-control" id="meal-fats" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Add Meal</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `,
        workoutTabContent: (muscleGroup, placeholderExercise) => {
            const currentTempSets = state.tempWorkoutSets.filter(set => set.muscleGroup === muscleGroup);
            return `
                <div class="tab-pane fade ${muscleGroup === 'chest' ? 'show active' : ''}" id="${muscleGroup}" role="tabpanel" aria-labelledby="${muscleGroup}-tab">
                    <h6 class="mt-3">${muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)} Exercises</h6>
                    <form id="${muscleGroup}-workout-form" class="add-set-form">
                        <div class="mb-3">
                            <label for="${muscleGroup}-exercise" class="form-label">Exercise</label>
                            <input type="text" class="form-control" id="${muscleGroup}-exercise" placeholder="${placeholderExercise}">
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <label for="${muscleGroup}-weight" class="form-label">Weight (kg)</label>
                                <input type="number" class="form-control" id="${muscleGroup}-weight">
                            </div>
                            <div class="col-6">
                                <label for="${muscleGroup}-reps" class="form-label">Reps</label>
                                <input type="number" class="form-control" id="${muscleGroup}-reps">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success btn-sm add-set-btn" data-muscle-group="${muscleGroup}">Add Set</button>
                    </form>
                    <h6 class="mt-4">Sets for this session:</h6>
                    <ul class="list-group" id="${muscleGroup}-temp-sets-list">
                        ${currentTempSets
                            .map(set => `<li class="list-group-item">${set.exercise}: ${set.weight}kg x ${set.reps} reps</li>`)
                            .join('')}
                        ${currentTempSets.length === 0 ?
                            '<li class="list-group-item text-muted">No sets added yet for this muscle group.</li>' : ''}
                    </ul>
                </div>
            `;
        },
        dashboard: (data) => {
            if (!data) return '';
            const { user, nutritionGoals, workoutLog, meals, waterIntake } = data;
            const summary = getWorkoutSummary(workoutLog);
            
            const calorieProgress = (nutritionGoals.currentCalories / nutritionGoals.targetCalories) * 100;
            const proteinProgress = (nutritionGoals.currentProtein / nutritionGoals.targetProtein) * 100;
            const carbsProgress = (nutritionGoals.currentCarbs / nutritionGoals.targetCarbs) * 100;
            const fatsProgress = (nutritionGoals.currentFats / nutritionGoals.targetFats) * 100;

            return `
                <div class="container">
                    <h1 class="mb-4">Welcome Back, ${user.fullName}!</h1>
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-person-fill me-2"></i>My Profile</h5>
                                    <p class="card-text">Age: ${user.age}</p>
                                    <p class="card-text">Weight: ${user.weight} kg</p>
                                    <p class="card-text">Height: ${user.height}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                <h5 class="card-title"><i class="bi bi-activity me-2"></i>Recent Activity</h5>

                                <!-- Last Workout -->
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <p class="mb-0"><strong>Last Workout:</strong></p>
                                        <p class="mb-0 text-muted">
                                            ${summary.lastWorkout ? `${summary.lastWorkout.exercise} on ${summary.lastWorkout.date}` : 'No workouts logged yet.'}
                                        </p>
                                    </div>
                                    <span class="badge bg-primary">Workout</span>
                                </div>
                                <hr>

                                <!-- Last Meal -->
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <p class="mb-0"><strong>Last Meal:</strong></p>
                                        <p class="mb-0 text-muted">
                                            ${meals.length > 0 ? `${meals[meals.length - 1].name} - ${meals[meals.length - 1].calories} kcal` : 'No meals logged today.'}
                                        </p>
                                    </div>
                                    <span class="badge bg-success">Nutrition</span>
                                </div>
                                <hr>

                                <!-- Water Intake -->
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p class="mb-0"><strong>Water Intake Today:</strong></p>
                                        <p class="mb-0 text-muted">${waterIntake / 1000} L</p>
                                    </div>
                                    <span class="badge bg-info">Hydration</span>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-journal-text me-2"></i>Workout Log</h5>
                                    <p class="card-text">Log your workouts and monitor your progress. Get stronger every day!</p>
                                    <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#workoutLogModal">Add Workout</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-egg-fried me-2"></i>Nutrition Goals</h5>
                                    <div>
                                        <p class="mb-1">Calories: ${nutritionGoals.currentCalories} / ${nutritionGoals.targetCalories} kcal</p>
                                        <div class="progress mb-2" style="height: 20px;">
                                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${calorieProgress}%" aria-valuenow="${nutritionGoals.currentCalories}" aria-valuemin="0" aria-valuemax="${nutritionGoals.targetCalories}"></div>
                                        </div>
                                        <p class="mb-1">Protein: ${nutritionGoals.currentProtein} / ${nutritionGoals.targetProtein} g</p>
                                        <div class="progress mb-2" style="height: 20px;">
                                            <div class="progress-bar bg-success" role="progressbar" style="width: ${proteinProgress}%" aria-valuenow="${nutritionGoals.currentProtein}" aria-valuemin="0" aria-valuemax="${nutritionGoals.targetProtein}"></div>
                                        </div>
                                        <p class="mb-1">Carbs: ${nutritionGoals.currentCarbs} / ${nutritionGoals.targetCarbs} g</p>
                                        <div class="progress mb-2" style="height: 20px;">
                                            <div class="progress-bar bg-warning" role="progressbar" style="width: ${carbsProgress}%" aria-valuenow="${nutritionGoals.currentCarbs}" aria-valuemin="0" aria-valuemax="${nutritionGoals.targetCarbs}"></div>
                                        </div>
                                        <p class="mb-1">Fats: ${nutritionGoals.currentFats} / ${nutritionGoals.targetFats} g</p>
                                        <div class="progress mb-2" style="height: 20px;">
                                            <div class="progress-bar bg-danger" role="progressbar" style="width: ${fatsProgress}%" aria-valuenow="${nutritionGoals.currentFats}" aria-valuemin="0" aria-valuemax="${nutritionGoals.targetFats}"></div>
                                        </div>
                                    </div>
                                    <button class="btn btn-secondary mt-3 me-2" data-bs-toggle="modal" data-bs-target="#addMealModal">Add Meal</button>
                                    <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#nutritionGoalModal">Set Goals</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        prs: (data) => {
            if (!data) return '';
            const { prs, workoutLog } = data;
            const summary = getWorkoutSummary(workoutLog);

            const renderMaxLifts = () => {
                if (Object.keys(summary.maxLifts).length === 0) {
                    return '<p>Log some workouts to see your max lifts!</p>';
                }
                return Object.entries(summary.maxLifts).map(([key, value]) => `
                    <p class="mb-1"><strong>${key}:</strong> ${value.weight}kg x ${value.reps} reps</p>
                `).join('');
            };

            return `
                <div class="container">
                    <h1>Personal Records</h1>
                    <p>Track your personal bests for Squat, Bench, and Deadlift. You can also view your complete workout history and progress here.</p>
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-person-fill me-2"></i>Squat PR</h5>
                                    <p class="card-text">${prs.squat || 0} kg</p>
                                    <button class="btn btn-primary btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#prModal" data-pr-type="squat">Update PR</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-person-fill me-2"></i>Bench PR</h5>
                                    <p class="card-text">${prs.bench || 0} kg</p>
                                    <button class="btn btn-primary btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#prModal" data-pr-type="bench">Update PR</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-person-fill me-2"></i>Deadlift PR</h5>
                                    <p class="card-text">${prs.deadlift || 0} kg</p>
                                    <button class="btn btn-primary btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#prModal" data-pr-type="deadlift">Update PR</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="my-5">

                    <h2 class="mt-4">Workout Records & Progression</h2>
                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-clock-history me-2"></i>Last Workout</h5>
                                    ${summary.lastWorkout ? `
                                        <p class="mb-0"><strong>${summary.lastWorkout.exercise}</strong> (${summary.lastWorkout.muscleGroup})</p>
                                        <p class="mb-0">${summary.lastWorkout.weight}kg x ${summary.lastWorkout.reps} reps</p>
                                        <p class="text-muted small">${summary.lastWorkout.date}</p>
                                    ` : '<p>No workouts logged yet.</p>'}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="bi bi-trophy me-2"></i>Max Lifts</h5>
                                    ${renderMaxLifts()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 class="mt-4">Logged Workouts</h2>
                    <div id="logged-workouts">
                        ${workoutLog.length > 0 ?
                            workoutLog.map(log => `
                                <div class="card shadow-sm mb-2">
                                    <div class="card-body">
                                        <p class="mb-0"><strong>${log.exercise}</strong> - ${log.weight}kg x ${log.reps} reps (${log.muscleGroup})</p>
                                    </div>
                                </div>
                            `).join('')
                            : '<p>No workouts logged yet. Add one!</p>'}
                    </div>
                </div>
            `;
        },
        foodProgram: (data) => {
            if (!data || !data.foodDictionary) return '<p>Loading food dictionary...</p>';
            const { user, foodDictionary } = data;
            const bmr = 10 * user.weight + 6.25 * parseFloat(user.height.replace("'", ".")) * 2.54 - 5 * user.age + 5; // Simplified BMR calculation
            const maintenance = bmr * 1.2; // Sedentary activity level

            return `
                <div class="container">
                    <h1>Food Program & Calorie Guidance</h1>
                    <p>Use this guide to help you choose clean foods to meet your daily macros.</p>
                    <div class="card shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Your Estimated Daily Calories</h5>
                            <p class="card-text">To maintain your current weight, you need approximately <strong>${maintenance.toFixed(0)} calories</strong> per day.</p>
                            <p class="card-text">Adjust based on your activity level and goals (e.g., deficit for weight loss, surplus for muscle gain).</p>
                        </div>
                    </div>
                    
                    <h2 class="mt-4">Food Dictionary</h2>
                    <div class="accordion" id="foodAccordion">
                        ${foodDictionary.map((category, index) => `
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="heading-food-${index}">
                                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-food-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-food-${index}">
                                        ${category.category}
                                    </button>
                                </h2>
                                <div id="collapse-food-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-food-${index}" data-bs-parent="#foodAccordion">
                                    <div class="accordion-body">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Food</th>
                                                    <th>Calories</th>
                                                    <th>Protein (g)</th>
                                                    <th>Carbs (g)</th>
                                                    <th>Fats (g)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${category.foods.map(food => `
                                                    <tr>
                                                        <td>${food.name}</td>
                                                        <td>${food.calories}</td>
                                                        <td>${food.protein}</td>
                                                        <td>${food.carbs}</td>
                                                        <td>${food.fats}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },
        workoutPlan: (data) => {
            if (!data) return '';
            const { workoutLog, workoutPlans, selectedPlan } = data;
            
            // If a plan is selected, show the detailed view
            if (selectedPlan) {
                return `
                    <div class="container">
                        <button class="btn btn-outline-secondary mb-4" id="back-to-plans-btn"><i class="bi bi-arrow-left"></i> Back to Plans</button>
                        <h1>${selectedPlan.name}</h1>
                        <p class="lead">${selectedPlan.description}</p>
                        
                        <div class="card shadow-sm mb-4">
                            <div class="card-body">
                                <h5 class="card-title">${selectedPlan.guidance.title}</h5>
                                <p><strong>Weight Selection:</strong> ${selectedPlan.guidance.weightSelection}</p>
                                <p><strong>Progression:</strong> ${selectedPlan.guidance.progression}</p>
                                <p><strong>Rest:</strong> ${selectedPlan.guidance.rest}</p>
                                <p><strong>Form:</strong> ${selectedPlan.guidance.form}</p>
                            </div>
                        </div>

                        <div class="accordion" id="planAccordion">
                            ${selectedPlan.schedule.map((phase, index) => `
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="heading-phase-${index}">
                                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-phase-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-phase-${index}">
                                            ${phase.phase}
                                        </button>
                                    </h2>
                                    <div id="collapse-phase-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-phase-${index}" data-bs-parent="#planAccordion">
                                        <div class="accordion-body">
                                            <p>${phase.description}</p>
                                            <p><strong>Schedule:</strong> ${phase.weekly_schedule}</p>
                                            ${phase.workouts.map(workout => `
                                                <h6>${workout.day}</h6>
                                                <ul class="list-group mb-3">
                                                    ${workout.exercises.map(ex => `<li class="list-group-item">${ex.name}: ${ex.sets}</li>`).join('')}
                                                </ul>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Otherwise, show the list of available plans
            return `
                <div class="container">
                    <h1>Workout Plans</h1>
                    <p>Choose a structured plan to follow for consistent results.</p>
                    <div class="row">
                        ${workoutPlans.map(plan => `
                            <div class="col-md-6 mb-4">
                                <div class="card shadow-sm h-100">
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="card-title">${plan.name}</h5>
                                        <p class="card-text flex-grow-1">${plan.description}</p>
                                        <button class="btn btn-primary mt-auto" data-plan-id="${plan.id}">View Full Plan</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },
        waterTracking: (data) => {
            if (!data) return '';
            const { waterIntake } = data;
            const targetWater = 3000; // ml
            const progress = (waterIntake / targetWater) * 100;
            return `
                <div class="container">
                    <h1>Water Intake Tracking</h1>
                    <p>Stay hydrated for optimal performance!</p>
                    <div class="card shadow-sm mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">Daily Water Goal</h5>
                            <h2 class="display-4">${waterIntake / 1000} L / ${targetWater / 1000} L</h2>
                            <div class="progress mt-3">
                                <div class="progress-bar bg-info" role="progressbar" style="width: ${progress > 100 ? 100 : progress}%" aria-valuenow="${waterIntake}" aria-valuemin="0" aria-valuemax="${targetWater}"></div>
                            </div>
                            <button id="add-water-btn" class="btn btn-info mt-3"><i class="bi bi-plus-circle me-2"></i>Add 250ml</button>
                            <button id="subtract-water-btn" class="btn btn-warning mt-3 ms-2"><i class="bi bi-dash-circle me-2"></i>Subtract 250ml</button>
                        </div>
                    </div>
                </div>
            `;
        },
        workoutDictionary: (data) => {
            if (!data || !data.workoutDictionary) return '<p>Loading workout dictionary...</p>';
            const { workoutDictionary } = data;

            // Group workouts by muscle group
            const groupedWorkouts = workoutDictionary.reduce((acc, workout) => {
                if (!acc[workout.muscleGroup]) {
                    acc[workout.muscleGroup] = [];
                }
                acc[workout.muscleGroup].push(workout);
                return acc;
            }, {});

            return `
                <div class="container">
                    <h1 class="mb-4">Workout Dictionary</h1>
                    <p>Your guide to different exercises.</p>

                    <div class="accordion" id="workoutAccordion">
                        ${Object.entries(groupedWorkouts).map(([muscleGroup, workouts], index) => `
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="heading-${index}">
                                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${index}">
                                        ${muscleGroup}
                                    </button>
                                </h2>
                                <div id="collapse-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-${index}" data-bs-parent="#workoutAccordion">
                                    <div class="accordion-body">
                                        ${workouts.map(workout => `
                                            <div class="row mb-4">
                                                <div class="col-md-4">
                                                    <img src="${workout.imageUrl}" class="img-fluid" alt="${workout.name}">
                                                </div>
                                                <div class="col-md-8">
                                                    <h4>${workout.name}</h4>
                                                    <p><strong>Instructions:</strong></p>
                                                    <ol>
                                                        ${workout.instructions.map(step => `<li>${step}</li>`).join('')}
                                                    </ol>
                                                </div>
                                            </div>
                                            <hr>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    };

    const render = () => {
        // Recalculate current nutrition totals from meals
        state.nutritionGoals.currentCalories = state.meals.reduce((total, meal) => total + meal.calories, 0);
        state.nutritionGoals.currentProtein = state.meals.reduce((total, meal) => total + meal.protein, 0);
        state.nutritionGoals.currentCarbs = state.meals.reduce((total, meal) => total + meal.carbs, 0);
        state.nutritionGoals.currentFats = state.meals.reduce((total, meal) => total + meal.fats, 0);

        console.log("Render called. User:", state.user ? state.user.username : 'none', "View:", state.currentView);
        if (state.user) {
            let viewContent = '';
            const templateData = { 
                user: state.user, 
                prs: state.prs, 
                waterIntake: state.waterIntake, 
                workoutLog: state.workoutLog, 
                tempWorkoutSets: state.tempWorkoutSets, 
                workoutDictionary: state.workoutDictionary, 
                nutritionGoals: state.nutritionGoals, 
                foodDictionary: state.foodDictionary,
                workoutPlans: state.workoutPlans,
                selectedPlan: state.selectedPlan,
                meals: state.meals
            };
            switch (state.currentView) {
                case 'dashboard':
                    viewContent = templates.dashboard(templateData);
                    break;
                case 'prs':
                    viewContent = templates.prs(templateData);
                    break;
                case 'foodProgram':
                    viewContent = templates.foodProgram(templateData);
                    break;
                case 'workoutPlan':
                    viewContent = templates.workoutPlan(templateData);
                    break;
                case 'waterTracking':
                    viewContent = templates.waterTracking(templateData);
                    break;
                case 'workoutDictionary':
                    viewContent = templates.workoutDictionary(templateData);
                    break;
                default:
                    viewContent = templates.dashboard(templateData);
            }
            app.innerHTML = templates.layout(viewContent, state.user);
            addDashboardEventListeners(); // Add event listeners after rendering dashboard
        } else {
            app.innerHTML = templates.loginPage();
        }
    };

    const addDashboardEventListeners = () => {
        // Handle navigation clicks
        document.querySelectorAll('a[data-view]').forEach(link => {
            link.removeEventListener('click', handleViewChange); // Prevent multiple listeners
            link.addEventListener('click', handleViewChange);
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', actions.logout);
            logoutBtn.addEventListener('click', actions.logout);
        }

        // Water buttons
        const addWaterBtn = document.getElementById('add-water-btn');
        if (addWaterBtn) {
            addWaterBtn.removeEventListener('click', actions.addWater);
            addWaterBtn.addEventListener('click', actions.addWater);
        }
        const subtractWaterBtn = document.getElementById('subtract-water-btn');
        if (subtractWaterBtn) {
            subtractWaterBtn.removeEventListener('click', actions.subtractWater);
            subtractWaterBtn.addEventListener('click', actions.subtractWater);
        }

        // PR form submission
        const prForm = document.getElementById('pr-form');
        if (prForm) {
            prForm.removeEventListener('submit', actions.updatePr);
            prForm.addEventListener('submit', actions.updatePr);
        }
        
        // Nutrition Goal form submission
        const nutritionGoalForm = document.getElementById('nutrition-goal-form');
        if (nutritionGoalForm) {
            nutritionGoalForm.removeEventListener('submit', actions.updateNutritionGoals);
            nutritionGoalForm.addEventListener('submit', actions.updateNutritionGoals);
        }

        // Add Meal form submission
        const addMealForm = document.getElementById('add-meal-form');
        if (addMealForm) {
            addMealForm.removeEventListener('submit', actions.addMeal);
            addMealForm.addEventListener('submit', actions.addMeal);
        }

        // Save Workout Session button
        const saveWorkoutSessionBtn = document.getElementById('save-workout-session-btn');
        if (saveWorkoutSessionBtn) {
            saveWorkoutSessionBtn.removeEventListener('click', actions.saveWorkoutSession);
            saveWorkoutSessionBtn.addEventListener('click', actions.saveWorkoutSession);
        }

        // Handle modal dismissal to clear temp sets
        const workoutLogModalElement = document.getElementById('workoutLogModal');
        if (workoutLogModalElement) {
            workoutLogModalElement.removeEventListener('hidden.bs.modal', actions.clearTempSets);
            workoutLogModalElement.addEventListener('hidden.bs.modal', actions.clearTempSets);
        }

        // Workout Plan buttons
        const viewPlanButtons = document.querySelectorAll('[data-plan-id]');
        viewPlanButtons.forEach(button => {
            button.addEventListener('click', (e) => actions.viewPlan(e.target.dataset.planId));
        });

        const backToPlansBtn = document.getElementById('back-to-plans-btn');
        if (backToPlansBtn) {
            backToPlansBtn.addEventListener('click', actions.backToPlans);
        }


        // Debugging logs for modal display
        const prModalElement = document.getElementById('prModal');
        if (prModalElement) {
            prModalElement.addEventListener('show.bs.modal', () => console.log('PR Modal is about to be shown.'));
            prModalElement.addEventListener('shown.bs.modal', () => console.log('PR Modal is shown.'));
            prModalElement.addEventListener('hide.bs.modal', () => console.log('PR Modal is about to be hidden.'));
            prModalElement.addEventListener('hidden.bs.modal', () => console.log('PR Modal is hidden.'));
        }
        const workoutLogModalElementDebug = document.getElementById('workoutLogModal');
        if (workoutLogModalElementDebug) {
            workoutLogModalElementDebug.addEventListener('show.bs.modal', () => console.log('Workout Log Modal is about to be shown.'));
            workoutLogModalElementDebug.addEventListener('shown.bs.modal', () => console.log('Workout Log Modal is shown.'));
            workoutLogModalElementDebug.addEventListener('hide.bs.modal', () => console.log('Workout Log Modal is about to be hidden.'));
            workoutLogModalElementDebug.addEventListener('hidden.bs.modal', () => console.log('Workout Log Modal is hidden.'));
        }
    };

    const handleViewChange = (e) => {
        e.preventDefault();
        state.currentView = e.target.dataset.view;
        render();
    };

    const actions = {
        login: (username, password) => {
            console.log(`Attempting login for user: ${username}`);
            if (username === 'Timothy' && password === 'admin') {
                state.user = {
                    username: 'Timothy', fullName: 'Timothy Alvarez', age: 25,
                    weight: 85, height: '5\'11"'
                };
                state.dashboardData = { user: state.user }; // Keep dashboardData for now, but render uses state.user/prs etc.
                console.log("Login successful. Rendering dashboard.");
                render();
            } else {
                alert('Invalid credentials');
            }
        },
        logout: () => {
            state.user = null;
            state.dashboardData = null;
            state.currentView = 'dashboard';
            render();
        },
        addWater: () => {
            state.waterIntake += 250;
            render();
        },
        subtractWater: () => {
            state.waterIntake = Math.max(0, state.waterIntake - 250);
            render();
        },
        updatePr: (e) => {
            e.preventDefault();
            const squat = document.getElementById('squat-pr').value;
            const bench = document.getElementById('bench-pr').value;
            const deadlift = document.getElementById('deadlift-pr').value;

            state.prs.squat = parseInt(squat) || 0;
            state.prs.bench = parseInt(bench) || 0;
            state.prs.deadlift = parseInt(deadlift) || 0;

            render();
            const prModal = bootstrap.Modal.getInstance(document.getElementById('prModal'));
            if (prModal) prModal.hide();
        },
        updateNutritionGoals: (e) => {
            e.preventDefault();
            state.nutritionGoals.targetCalories = parseInt(document.getElementById('target-calories').value) || 0;
            state.nutritionGoals.targetProtein = parseInt(document.getElementById('target-protein').value) || 0;
            state.nutritionGoals.targetCarbs = parseInt(document.getElementById('target-carbs').value) || 0;
            state.nutritionGoals.targetFats = parseInt(document.getElementById('target-fats').value) || 0;

            const nutritionGoalModalEl = document.getElementById('nutritionGoalModal');
            const nutritionGoalModal = bootstrap.Modal.getInstance(nutritionGoalModalEl);

            // Add a one-time listener to re-render once the modal is fully hidden
            nutritionGoalModalEl.addEventListener('hidden.bs.modal', function onModalHidden() {
                render();
            }, { once: true }); // Use { once: true } to auto-remove the listener

            if (nutritionGoalModal) {
                nutritionGoalModal.hide();
            } else {
                // Fallback if modal instance isn't found
                render();
            }
        },
        addMeal: (e) => {
            e.preventDefault();
            const mealName = document.getElementById('meal-name').value;
            const calories = parseInt(document.getElementById('meal-calories').value) || 0;
            const protein = parseInt(document.getElementById('meal-protein').value) || 0;
            const carbs = parseInt(document.getElementById('meal-carbs').value) || 0;
            const fats = parseInt(document.getElementById('meal-fats').value) || 0;

            if (mealName && calories > 0) {
                state.meals.push({ name: mealName, calories, protein, carbs, fats });
                
                const addMealModalEl = document.getElementById('addMealModal');
                const addMealModal = bootstrap.Modal.getInstance(addMealModalEl);

                addMealModalEl.addEventListener('hidden.bs.modal', function onModalHidden() {
                    render();
                }, { once: true });

                if (addMealModal) {
                    addMealModal.hide();
                } else {
                    render();
                }
            } else {
                alert('Please enter at least a meal name and calories.');
            }
        },
        addTempSet: (e) => {
            e.preventDefault();
            console.log("addTempSet action triggered.");
            const form = e.target.closest('form');
            if (!form) {
                console.error("Could not find a parent form for the 'Add Set' button.");
                return;
            }
            const muscleGroup = form.id.replace('-workout-form', '');
            
            const exerciseInput = form.querySelector(`#${muscleGroup}-exercise`);
            const weightInput = form.querySelector(`#${muscleGroup}-weight`);
            const repsInput = form.querySelector(`#${muscleGroup}-reps`);

            if (!exerciseInput || !weightInput || !repsInput) {
                console.error("Could not find exercise, weight, or reps input fields in the form.");
                return;
            }
            
            const exercise = exerciseInput.value.trim();
            const weight = parseInt(weightInput.value, 10);
            const reps = parseInt(repsInput.value, 10);

            console.log(`Validating set: Exercise='${exercise}', Weight=${weight}, Reps=${reps}`);

            if (exercise && !isNaN(weight) && weight > 0 && !isNaN(reps) && reps > 0) {
                const newSet = { muscleGroup, exercise, weight, reps, date: new Date().toLocaleDateString() };
                state.tempWorkoutSets.push(newSet);
                console.log("Set added successfully. Current temp sets:", state.tempWorkoutSets);
                
                // Clear form fields for next entry
                exerciseInput.value = '';
                weightInput.value = '';
                repsInput.value = '';

                // Manually update the UI to show the new set
                const tempSetsList = document.getElementById(`${muscleGroup}-temp-sets-list`);
                if (tempSetsList) {
                    // Remove the "No sets added yet" message if it exists
                    const noSetsMessage = tempSetsList.querySelector('.text-muted');
                    if (noSetsMessage) {
                        tempSetsList.innerHTML = ''; // Clear the list before adding the first item
                    }
                    
                    const newSetItem = document.createElement('li');
                    newSetItem.className = 'list-group-item';
                    newSetItem.textContent = `${exercise}: ${weight}kg x ${reps} reps`;
                    tempSetsList.appendChild(newSetItem);
                }
            } else {
                alert('Please make sure you have entered a valid Exercise name, a Weight greater than 0, and a Rep count greater than 0.');
                console.warn("Set validation failed. Set was not added.");
            }
        },
        saveWorkoutSession: () => {
            console.log("saveWorkoutSession called");
            if (state.tempWorkoutSets.length > 0) {
                // Here, you would typically send the data to the backend
                // For now, we just update the local state
                state.workoutLog = state.workoutLog.concat(state.tempWorkoutSets);
                state.tempWorkoutSets = []; // Clear temporary sets
                
                // Manually hide the modal and then re-render
                const workoutLogModalEl = document.getElementById('workoutLogModal');
                const workoutLogModal = bootstrap.Modal.getInstance(workoutLogModalEl);
                
                // Add a listener to re-render once the modal is fully hidden
                workoutLogModalEl.addEventListener('hidden.bs.modal', function onModalHidden() {
                    render();
                    // Remove the event listener to avoid multiple renders in the future
                    workoutLogModalEl.removeEventListener('hidden.bs.modal', onModalHidden);
                });

                if (workoutLogModal) {
                    workoutLogModal.hide();
                } else {
                    // Fallback if modal instance isn't found
                    render();
                }

            } else {
                alert('No sets added to save!');
            }
        },
        clearTempSets: () => {
            console.log("clearTempSets called");
            state.tempWorkoutSets = [];
            render(); // Re-render to clear the displayed temp sets if modal is dismissed without saving
        },
        viewPlan: (planId) => {
            state.selectedPlan = state.workoutPlans.find(p => p.id === planId);
            render();
        },
        backToPlans: () => {
            state.selectedPlan = null;
            render();
        }
    };

    document.addEventListener('submit', (e) => {
        // Prevent default submission for all forms initially, then handle specific forms
        // This is done via addDashboardEventListeners for specific forms
        if (e.target.id === 'login-form') {
            e.preventDefault();
            console.log("Login form submitted.");
            const username = e.target.querySelector('#username').value;
            const password = e.target.querySelector('#password').value;
            actions.login(username, password);
        } else if (e.target.classList.contains('add-set-form')) {
            // This event listener is now handled by the global click listener
            // e.preventDefault() is called in addTempSet directly
        } else if (e.target.id === 'pr-form') {
            e.preventDefault(); // Prevent page reload for PR form
        }
    });
    
    // Global click listener for dynamically added buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-set-btn')) {
            actions.addTempSet(e); // Let addTempSet handle preventDefault
        } else if (e.target.id === 'logout-btn') {
            actions.logout();
        } else if (e.target.id === 'add-water-btn') {
            actions.addWater();
        } else if (e.target.id === 'subtract-water-btn') {
            actions.subtractWater();
        }
    });

    const loadWorkoutDictionary = async () => {
        try {
            const res = await fetch('/api/data/workout-dictionary');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            state.workoutDictionary = await res.json();
            console.log("Workout dictionary loaded:", state.workoutDictionary);
            // If the initial view is the dictionary, render again
            if (state.currentView === 'workoutDictionary') {
                render();
            }
        } catch (error) {
            console.error("Could not load workout dictionary:", error);
        }
    };

    const loadFoodDictionary = async () => {
        try {
            const res = await fetch('/api/data/food-dictionary');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            state.foodDictionary = await res.json();
            console.log("Food dictionary loaded:", state.foodDictionary);
            // If the initial view is the food program, render again
            if (state.currentView === 'foodProgram') {
                render();
            }
        } catch (error) {
            console.error("Could not load food dictionary:", error);
        }
    };

    const loadWorkoutPlans = async () => {
        try {
            const res = await fetch('/api/data/beginner-strength-plan');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            // Since we're loading one plan, we wrap it in an array for consistency
            const plan = await res.json();
            state.workoutPlans = [plan]; 
            console.log("Workout plans loaded:", state.workoutPlans);
        } catch (error) {
            console.error("Could not load workout plans:", error);
        }
    };

    const init = () => {
        console.log("Initializing...");
        loadWorkoutDictionary();
        loadFoodDictionary();
        loadWorkoutPlans();
        render();
    };

    init();
});