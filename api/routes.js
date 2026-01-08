// api/routes.js
const express = require('express');
const router = express.Router();
const authService = require('../auth/auth.service');
const nutritionService = require('../services/nutrition.service');
const trackingService = require('../services/tracking.service');
const workoutService = require('../services/workout.service');
const alertService = require('../services/alert.service');
const dataService = require('../services/data.service');

const workoutPlanService = require('../services/workout-plan.service');

// Middleware to protect routes
const requireAuth = async (req, res, next) => {
    const user = await authService.getLoggedInUser();
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    req.user = user;
    next();
};

// --- Auth Routes ---
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, profile, goals } = req.body;
        // Basic validation - more comprehensive validation should be in authService or a separate middleware
        if (!username || !password || !profile || !goals) {
            const error = new Error('Missing required registration fields.');
            error.statusCode = 400;
            return next(error);
        }

        const newUser = await authService.register(username, password, profile, goals, null);
        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (error) {
        if (error.message === 'User already exists.') {
            error.statusCode = 409; // Conflict
        } else if (error.message === 'Missing required registration fields.') {
            error.statusCode = 400; // Bad Request
        }
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await authService.login(username, password);
        res.json({ message: 'Login successful!', user });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', (req, res, next) => {
    try {
        authService.logout();
        res.json({ message: 'Logout successful!' });
    } catch (error) {
        next(error);
    }
});

// --- User & Dashboard Routes ---
router.get('/user/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

router.get('/dashboard', requireAuth, async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const nutritionPlan = nutritionService.getNutritionPlan(req.user);
        const foodLog = await trackingService.getFoodLogForDate(req.user.id, today);
        const waterLog = await trackingService.getWaterLogForDate(req.user.id, today);
        const alerts = await alertService.getAlerts(req.user);

        let workoutPlan = null;
        let todayWorkout = null;

        if (req.user.workoutPlanId) {
            workoutPlan = await workoutPlanService.getWorkoutPlanById(req.user.workoutPlanId);
            if (workoutPlan) {
                const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
                todayWorkout = workoutPlan.dailyWorkouts.find(dw => dw.day === dayOfWeek);
            }
        }
        
        res.json({
            user: req.user,
            nutritionPlan,
            foodLog,
            waterLog,
            alerts,
            workoutPlan,
            todayWorkout
        });
    } catch (error) {
        next(error);
    }
});

router.put('/profile', requireAuth, async (req, res, next) => {
    try {
        const updatedUser = await dataService.update('users', req.user.id, req.body);
        res.json({ message: 'Profile updated successfully!', user: updatedUser });
    } catch (error) {
        next(error);
    }
});

router.put('/user/workout-plan', requireAuth, async (req, res, next) => {
    try {
        const { workoutPlanId } = req.body;
        if (!workoutPlanId) {
            return res.status(400).json({ message: 'workoutPlanId is required.' });
        }
        const updatedUser = await dataService.update('users', req.user.id, { workoutPlanId });
        res.json({ message: 'Workout plan updated successfully!', user: updatedUser });
    } catch (error) {
        next(error);
    }
});



// --- Tracking Routes ---
router.post('/meals', requireAuth, async (req, res, next) => {
    try {
        const meal = await trackingService.addMeal(req.user.id, req.body);
        res.status(201).json({ message: 'Meal added!', meal });
    }
     catch (error) {
        next(error);
    }
});

router.post('/water', requireAuth, async (req, res, next) => {
    try {
        const { amount } = req.body;
        const waterLog = await trackingService.addWaterIntake(req.user.id, amount);
        res.status(201).json({ message: 'Water intake added!', waterLog });
    } catch (error) {
        next(error);
    }
});

router.post('/water/subtract', requireAuth, async (req, res, next) => {
    try {
        const { amount } = req.body;
        const waterLog = await trackingService.subtractWaterIntake(req.user.id, amount);
        res.status(200).json({ message: 'Water intake subtracted!', waterLog });
    } catch (error) {
        next(error);
    }
});


router.post('/prs', requireAuth, async (req, res, next) => {
    try {
        const { exercise, value } = req.body;
        const newPR = await trackingService.addPR(req.user.id, exercise, value);
        res.status(201).json({ message: 'PR added!', pr: newPR });
    } catch (error) {
        next(error);
    }
});

router.get('/prs', requireAuth, async(req, res, next) => {
    try {
        const prs = await trackingService.getPRsForUser(req.user.id);
        res.json(prs);
    } catch(error) {
        next(error);
    }
});

// --- Workout Routes ---
router.post('/workout-plans', requireAuth, async (req, res, next) => {
    try {
        const { name, description, exercises } = req.body;
        const newPlan = await workoutService.createWorkoutPlan(req.user.id, name, description, exercises);
        res.status(201).json({ message: 'Workout plan created!', plan: newPlan });
    } catch (error) {
        next(error);
    }
});

router.get('/workout-plans', requireAuth, async (req, res, next) => {
    try {
        const plans = await workoutService.getWorkoutPlansForUser(req.user.id);
        res.json(plans);
    } catch (error) {
        next(error);
    }
});

router.post('/workout-logs', requireAuth, async (req, res, next) => {
    try {
        const { planId, exercises } = req.body;
        const log = await workoutService.logWorkout(req.user.id, planId, exercises);
        res.status(201).json({ message: 'Workout logged!', log });
    } catch (error) {
        next(error);
    }
});

router.get('/recommended-workout/:planId', requireAuth, async (req, res, next) => {
    try {
        const exercises = await workoutService.recommendNextWorkout(req.user.id, req.params.planId);
        res.json(exercises);
    } catch (error) {
        next(error);
    }
});

router.get('/workout-plans/all', async (req, res, next) => {
    try {
        const allPlans = await workoutPlanService.getAllWorkoutPlans();
        res.json(allPlans);
    } catch (error) {
        next(error);
    }
});

// --- Data Routes ---
router.get('/data/workout-dictionary', async (req, res, next) => {
    try {
        const data = await dataService.find('workout-dictionary');
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/data/food-dictionary', async (req, res, next) => {
    try {
        const data = await dataService.find('food-dictionary');
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/data/beginner-strength-plan', async (req, res, next) => {
    try {
        const data = await dataService.find('beginner-strength-plan');
        res.json(data);
    } catch (error) {
        next(error);
    }
});


module.exports = router;
