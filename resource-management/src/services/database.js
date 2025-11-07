import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== USER MANAGEMENT ====================

export const createUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// ==================== PROJECT MANAGEMENT ====================

export const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      allocations: [],
      expenses: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProject = async (projectId) => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const getAllProjects = async () => {
  try {
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    return projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const updateProject = async (projectId, updates) => {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjectsByManager = async (managerId) => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('managerId', '==', managerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting projects by manager:', error);
    throw error;
  }
};

// ==================== RESOURCE ALLOCATION ====================

export const allocateResource = async (projectId, allocationData) => {
  try {
    const allocation = {
      ...allocationData,
      allocatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'projects', projectId), {
      allocations: arrayUnion(allocation),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error allocating resource:', error);
    throw error;
  }
};

export const removeResourceAllocation = async (projectId, employeeId) => {
  try {
    const project = await getProject(projectId);
    const updatedAllocations = project.allocations.filter(
      alloc => alloc.employeeId !== employeeId
    );

    await updateDoc(doc(db, 'projects', projectId), {
      allocations: updatedAllocations,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing resource allocation:', error);
    throw error;
  }
};

export const updateResourceAllocation = async (projectId, employeeId, updates) => {
  try {
    const project = await getProject(projectId);
    const updatedAllocations = project.allocations.map(alloc =>
      alloc.employeeId === employeeId
        ? { ...alloc, ...updates, updatedAt: serverTimestamp() }
        : alloc
    );

    await updateDoc(doc(db, 'projects', projectId), {
      allocations: updatedAllocations,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating resource allocation:', error);
    throw error;
  }
};

export const getEmployeeAllocations = async (employeeId) => {
  try {
    const projects = await getAllProjects();
    const allocations = [];

    projects.forEach(project => {
      if (project.allocations) {
        const empAllocation = project.allocations.find(
          alloc => alloc.employeeId === employeeId
        );
        if (empAllocation) {
          allocations.push({
            projectId: project.id,
            projectName: project.name,
            ...empAllocation
          });
        }
      }
    });

    return allocations;
  } catch (error) {
    console.error('Error getting employee allocations:', error);
    throw error;
  }
};

// ==================== EXPENSE MANAGEMENT ====================

export const addProjectExpense = async (projectId, expenseData) => {
  try {
    const expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'projects', projectId), {
      expenses: arrayUnion(expense),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding project expense:', error);
    throw error;
  }
};

// ==================== SKILLS & CERTIFICATIONS ====================

export const addSkill = async (userId, skill) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      skills: arrayUnion(skill),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
};

export const removeSkill = async (userId, skill) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      skills: arrayRemove(skill),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing skill:', error);
    throw error;
  }
};

export const addCertification = async (userId, certification) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      certifications: arrayUnion(certification),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding certification:', error);
    throw error;
  }
};

// ==================== ANALYTICS & REPORTS ====================

export const getOrganizationKPIs = async () => {
  try {
    const users = await getAllUsers();
    const projects = await getAllProjects();

    const employees = users.filter(u => u.role === 'employee');
    const activeProjects = projects.filter(p => p.status === 'active');

    let totalAllocation = 0;
    let totalBudget = 0;
    let totalSpent = 0;

    projects.forEach(project => {
      if (project.budget) totalBudget += project.budget;
      if (project.expenses) {
        project.expenses.forEach(exp => {
          totalSpent += exp.amount || 0;
        });
      }
      if (project.allocations) {
        project.allocations.forEach(alloc => {
          totalAllocation += alloc.allocationPercentage || 0;
        });
      }
    });

    const avgUtilization = employees.length > 0
      ? totalAllocation / employees.length
      : 0;

    return {
      totalEmployees: employees.length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      avgResourceUtilization: avgUtilization
    };
  } catch (error) {
    console.error('Error getting organization KPIs:', error);
    throw error;
  }
};

export const getEmployeeUtilization = async (employeeId) => {
  try {
    const allocations = await getEmployeeAllocations(employeeId);
    const totalAllocation = allocations.reduce(
      (sum, alloc) => sum + (alloc.allocationPercentage || 0),
      0
    );

    return {
      allocations,
      totalAllocation,
      availableCapacity: 100 - totalAllocation,
      projectCount: allocations.length
    };
  } catch (error) {
    console.error('Error getting employee utilization:', error);
    throw error;
  }
};

export const getProjectKPIs = async (projectId) => {
  try {
    const project = await getProject(projectId);
    if (!project) return null;

    const totalSpent = project.expenses
      ? project.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
      : 0;

    const budgetUtilization = project.budget > 0
      ? (totalSpent / project.budget) * 100
      : 0;

    const resourceCount = project.allocations ? project.allocations.length : 0;

    const totalAllocation = project.allocations
      ? project.allocations.reduce(
          (sum, alloc) => sum + (alloc.allocationPercentage || 0),
          0
        )
      : 0;

    return {
      ...project,
      totalSpent,
      budgetUtilization,
      resourceCount,
      totalAllocation,
      remainingBudget: project.budget - totalSpent
    };
  } catch (error) {
    console.error('Error getting project KPIs:', error);
    throw error;
  }
};
