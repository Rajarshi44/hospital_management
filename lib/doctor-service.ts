import type { Doctor } from './types'

// Mock data for doctors
export const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    employeeId: "DOC001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    phone: "+1-555-0101",
    dateOfBirth: new Date("1985-03-15"),
    gender: "Female",
    address: "123 Medical Lane, Healthcare City, HC 12345",
    specialization: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    department: "Cardiology",
    licenseNumber: "MD-12345-2020",
    licenseExpiry: new Date("2025-12-31"),
    medicalDegree: "MD",
    medicalSchool: "Harvard Medical School",
    graduationYear: 2010,
    residency: {
      hospital: "Massachusetts General Hospital",
      specialty: "Internal Medicine",
      startYear: 2010,
      endYear: 2013
    },
    fellowship: {
      hospital: "Mayo Clinic",
      specialty: "Cardiology",
      startYear: 2013,
      endYear: 2016
    },
    boardCertifications: [
      {
        board: "American Board of Internal Medicine",
        specialty: "Cardiology",
        certificationDate: new Date("2016-05-01"),
        expiryDate: new Date("2026-05-01")
      }
    ],
    experience: 9,
    languagesSpoken: ["English", "Spanish"],
    consultationFee: 250,
    emergencyContact: {
      name: "Michael Johnson",
      relationship: "Spouse",
      phone: "+1-555-0102"
    },
    schedule: {
      monday: { start: "08:00", end: "17:00", isWorking: true },
      tuesday: { start: "08:00", end: "17:00", isWorking: true },
      wednesday: { start: "08:00", end: "17:00", isWorking: true },
      thursday: { start: "08:00", end: "17:00", isWorking: true },
      friday: { start: "08:00", end: "15:00", isWorking: true },
      saturday: { start: "09:00", end: "13:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    isActive: true,
    joinDate: new Date("2020-01-15"),
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    biography: "Dr. Sarah Johnson is a highly skilled cardiologist with over 9 years of experience in interventional cardiology. She specializes in complex cardiac procedures and has published numerous research papers in leading medical journals.",
    achievements: [
      "Outstanding Physician Award 2023",
      "Research Excellence Award 2022",
      "Patient Choice Award 2021"
    ],
    publications: [
      {
        title: "Advances in Minimally Invasive Cardiac Surgery",
        journal: "Journal of Cardiology",
        publicationDate: new Date("2023-06-15"),
        doi: "10.1234/jc.2023.06.001"
      }
    ],
    createdAt: new Date("2020-01-15"),
    updatedAt: new Date("2024-10-22")
  },
  {
    id: "doc-2",
    employeeId: "DOC002",
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@hospital.com",
    phone: "+1-555-0103",
    dateOfBirth: new Date("1980-07-22"),
    gender: "Male",
    address: "456 Health Avenue, Medical District, MD 54321",
    specialization: "Neurology",
    department: "Neurology",
    licenseNumber: "MD-67890-2018",
    licenseExpiry: new Date("2025-12-31"),
    medicalDegree: "MD, PhD",
    medicalSchool: "Johns Hopkins School of Medicine",
    graduationYear: 2008,
    residency: {
      hospital: "Johns Hopkins Hospital",
      specialty: "Neurology",
      startYear: 2008,
      endYear: 2012
    },
    fellowship: {
      hospital: "Cleveland Clinic",
      specialty: "Movement Disorders",
      startYear: 2012,
      endYear: 2014
    },
    boardCertifications: [
      {
        board: "American Board of Psychiatry and Neurology",
        specialty: "Neurology",
        certificationDate: new Date("2014-08-01"),
        expiryDate: new Date("2024-08-01")
      }
    ],
    experience: 11,
    languagesSpoken: ["English", "Mandarin", "Cantonese"],
    consultationFee: 300,
    emergencyContact: {
      name: "Lisa Chen",
      relationship: "Spouse",
      phone: "+1-555-0104"
    },
    schedule: {
      monday: { start: "09:00", end: "18:00", isWorking: true },
      tuesday: { start: "09:00", end: "18:00", isWorking: true },
      wednesday: { start: "09:00", end: "18:00", isWorking: true },
      thursday: { start: "09:00", end: "18:00", isWorking: true },
      friday: { start: "09:00", end: "16:00", isWorking: true },
      saturday: { start: "", end: "", isWorking: false },
      sunday: { start: "", end: "", isWorking: false }
    },
    isActive: true,
    joinDate: new Date("2018-03-01"),
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    biography: "Dr. David Chen is a renowned neurologist with expertise in movement disorders and neurodegenerative diseases. He has contributed significantly to Parkinson's disease research.",
    achievements: [
      "Neurologist of the Year 2022",
      "Clinical Research Award 2021",
      "Teaching Excellence Award 2020"
    ],
    publications: [
      {
        title: "Novel Treatments for Parkinson's Disease",
        journal: "Nature Neuroscience",
        publicationDate: new Date("2023-03-10"),
        doi: "10.1038/nn.2023.03.001"
      }
    ],
    createdAt: new Date("2018-03-01"),
    updatedAt: new Date("2024-10-22")
  },
  {
    id: "doc-3",
    employeeId: "DOC003",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@hospital.com",
    phone: "+1-555-0105",
    dateOfBirth: new Date("1990-11-08"),
    gender: "Female",
    address: "789 Wellness Street, Care City, CC 98765",
    specialization: "Pediatrics",
    subSpecialty: "Pediatric Emergency Medicine",
    department: "Pediatrics",
    licenseNumber: "MD-11111-2022",
    licenseExpiry: new Date("2027-12-31"),
    medicalDegree: "MD",
    medicalSchool: "Stanford University School of Medicine",
    graduationYear: 2016,
    residency: {
      hospital: "Children's Hospital of Philadelphia",
      specialty: "Pediatrics",
      startYear: 2016,
      endYear: 2019
    },
    fellowship: {
      hospital: "Boston Children's Hospital",
      specialty: "Pediatric Emergency Medicine",
      startYear: 2019,
      endYear: 2021
    },
    boardCertifications: [
      {
        board: "American Board of Pediatrics",
        specialty: "Pediatrics",
        certificationDate: new Date("2019-06-01"),
        expiryDate: new Date("2029-06-01")
      },
      {
        board: "American Board of Pediatrics",
        specialty: "Pediatric Emergency Medicine",
        certificationDate: new Date("2021-08-01"),
        expiryDate: new Date("2031-08-01")
      }
    ],
    experience: 5,
    languagesSpoken: ["English", "Spanish", "Portuguese"],
    consultationFee: 200,
    emergencyContact: {
      name: "Carlos Rodriguez",
      relationship: "Father",
      phone: "+1-555-0106"
    },
    schedule: {
      monday: { start: "07:00", end: "19:00", isWorking: true },
      tuesday: { start: "07:00", end: "19:00", isWorking: true },
      wednesday: { start: "07:00", end: "19:00", isWorking: true },
      thursday: { start: "07:00", end: "19:00", isWorking: true },
      friday: { start: "07:00", end: "19:00", isWorking: true },
      saturday: { start: "08:00", end: "14:00", isWorking: true },
      sunday: { start: "08:00", end: "14:00", isWorking: true }
    },
    isActive: true,
    joinDate: new Date("2022-07-01"),
    profileImage: "https://images.unsplash.com/photo-1594824953166-b24fa3de3ce2?w=400",
    biography: "Dr. Emily Rodriguez is a dedicated pediatrician specializing in emergency medicine. She is passionate about providing comprehensive care to children and adolescents.",
    achievements: [
      "Rising Star Award 2023",
      "Community Service Award 2022"
    ],
    publications: [
      {
        title: "Pediatric Emergency Care Best Practices",
        journal: "Pediatric Emergency Care",
        publicationDate: new Date("2023-09-20"),
        doi: "10.1097/pec.2023.09.001"
      }
    ],
    createdAt: new Date("2022-07-01"),
    updatedAt: new Date("2024-10-22")
  }
]

// Service functions
export const getDoctors = (): Promise<Doctor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDoctors), 500)
  })
}

export const getDoctorById = (id: string): Promise<Doctor | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const doctor = mockDoctors.find(d => d.id === id)
      resolve(doctor || null)
    }, 300)
  })
}

export const createDoctor = (doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDoctor: Doctor = {
        ...doctorData,
        id: `doc-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockDoctors.push(newDoctor)
      resolve(newDoctor)
    }, 800)
  })
}

export const updateDoctor = (id: string, updates: Partial<Doctor>): Promise<Doctor | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockDoctors.findIndex(d => d.id === id)
      if (index !== -1) {
        mockDoctors[index] = {
          ...mockDoctors[index],
          ...updates,
          updatedAt: new Date()
        }
        resolve(mockDoctors[index])
      } else {
        resolve(null)
      }
    }, 600)
  })
}

export const deleteDoctor = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockDoctors.findIndex(d => d.id === id)
      if (index !== -1) {
        mockDoctors.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 400)
  })
}

export const getDoctorsByDepartment = (department: string): Promise<Doctor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const doctors = mockDoctors.filter(d => d.department.toLowerCase() === department.toLowerCase())
      resolve(doctors)
    }, 400)
  })
}

export const searchDoctors = (query: string): Promise<Doctor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase()
      const doctors = mockDoctors.filter(d => 
        d.firstName.toLowerCase().includes(lowercaseQuery) ||
        d.lastName.toLowerCase().includes(lowercaseQuery) ||
        d.specialization.toLowerCase().includes(lowercaseQuery) ||
        d.department.toLowerCase().includes(lowercaseQuery) ||
        d.employeeId.toLowerCase().includes(lowercaseQuery)
      )
      resolve(doctors)
    }, 400)
  })
}

// Utility functions
export const getDepartments = (): string[] => {
  const departments = [...new Set(mockDoctors.map(d => d.department))]
  return departments.sort()
}

export const getSpecializations = (): string[] => {
  const specializations = [...new Set(mockDoctors.map(d => d.specialization))]
  return specializations.sort()
}

export const getDoctorStats = () => {
  const total = mockDoctors.length
  const active = mockDoctors.filter(d => d.isActive).length
  const inactive = total - active
  const byDepartment = mockDoctors.reduce((acc, doctor) => {
    acc[doctor.department] = (acc[doctor.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total,
    active,
    inactive,
    byDepartment
  }
}