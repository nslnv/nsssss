import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Admin test route called");
    
    const { username, password } = await request.json();
    console.log("📝 Request data:", { username, password: password ? "***" : "missing" });

    // Check if admin user exists
    const existingAdmins = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin"));
    console.log("👤 Admin users found:", existingAdmins.length);

    let adminUser = existingAdmins[0];

    // If admin doesn't exist, create one
    if (!adminUser) {
      console.log("🔨 Creating admin user...");
      
      const hashedPassword = await bcryptjs.hash("admin123", 12);
      console.log("🔐 Password hashed successfully");

      const newAdmin = {
        username: "admin",
        email: "admin@example.com",
        passwordHash: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      const insertResult = await db.insert(adminUsers).values(newAdmin).returning();
      adminUser = insertResult[0];
      console.log("✅ Admin user created successfully");
    } else {
      console.log("ℹ️ Admin user already exists");
      
      // Update password to ensure consistency
      const hashedPassword = await bcryptjs.hash("admin123", 12);
      await db.update(adminUsers)
        .set({ passwordHash: hashedPassword })
        .where(eq(adminUsers.username, "admin"));
      
      // Refresh admin user data
      const updatedAdmins = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin"));
      adminUser = updatedAdmins[0];
      console.log("🔄 Admin user password updated");
    }

    // Test login if credentials provided
    if (username && password) {
      console.log("🔐 Testing login credentials...");
      
      if (username !== "admin") {
        console.log("❌ Invalid username provided");
        return NextResponse.json({
          success: false,
          message: "Invalid username",
          details: {
            providedUsername: username,
            expectedUsername: "admin"
          }
        }, { status: 401 });
      }

      const isPasswordValid = await bcryptjs.compare(password, adminUser.passwordHash);
      console.log("🔍 Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Invalid password provided");
        return NextResponse.json({
          success: false,
          message: "Invalid password",
          details: {
            passwordProvided: true,
            passwordMatches: false
          }
        }, { status: 401 });
      }

      console.log("✅ Login credentials valid");
      return NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          createdAt: adminUser.createdAt
        },
        details: {
          adminUserExists: true,
          passwordMatches: true,
          loginSuccessful: true
        }
      });
    }

    // If no credentials provided, just return admin user info
    return NextResponse.json({
      success: true,
      message: "Admin user verified/created",
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        createdAt: adminUser.createdAt
      },
      details: {
        adminUserExists: true,
        credentialsProvided: false,
        defaultCredentials: {
          username: "admin",
          password: "admin123"
        }
      }
    });

  } catch (error: any) {
    console.error("❌ Admin test route error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}