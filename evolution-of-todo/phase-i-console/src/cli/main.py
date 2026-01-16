"""CLI interface for Phase I console todo manager."""

import sys
from pathlib import Path

# Add parent directory to path to allow both direct execution and module execution
# This ensures imports work whether running as: python src/cli/main.py or python -m src.cli.main
if __name__ == "__main__":
    # When running directly, add the phase-i-console directory to path
    # Path(__file__) = phase-i-console/src/cli/main.py
    # parent.parent.parent = phase-i-console/
    project_root = Path(__file__).resolve().parent.parent.parent
    project_root_str = str(project_root)
    if project_root_str not in sys.path:
        sys.path.insert(0, project_root_str)

from src.models.task import Task
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService


class TodoCLI:
    """Command-line interface for todo management."""
    
    def __init__(self):
        """Initialize CLI with service layer."""
        repository = InMemoryTaskRepository()
        self.service = TaskService(repository)
    
    def display_menu(self) -> None:
        """Display the main menu options."""
        print("\n" + "=" * 40)
        print("📋  TODO MANAGER  📋")
        print("=" * 40)
        print("1️⃣   Add new task ➕")
        print("2️⃣   List all tasks 📝")
        print("3️⃣   Mark task complete ✅")
        print("4️⃣   Update task ✏️")
        print("5️⃣   Delete task 🗑️")
        print("6️⃣   Exit 👋")
        print("=" * 40)
        print()
    
    def display_tasks(self, tasks: list[Task]) -> None:
        """
        Display a list of tasks.
        
        Args:
            tasks: List of Task instances to display
        """
        if not tasks:
            print("\n📭  No tasks found. Your list is empty! 🎉")
            print("   Try adding a task with option 1️⃣\n")
            return
        
        print("\n" + "─" * 50)
        print(f"📋  YOUR TASKS ({len(tasks)} total)")
        print("─" * 50)
        
        completed_count = sum(1 for task in tasks if task.is_completed)
        pending_count = len(tasks) - completed_count
        
        for i, task in enumerate(tasks, 1):
            if task.is_completed:
                status_icon = "✅"
                status_text = "COMPLETED"
            else:
                status_icon = "⏳"
                status_text = "PENDING"
            
            print(f"\n{status_icon}  Task #{i} [{status_text}]")
            print(f"   ID: {task.id}")
            print(f"   📝 {task.description}")
            print(f"   🕐 Created: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n" + "─" * 50)
        print(f"📊 Summary: {pending_count} pending | {completed_count} completed")
        print("─" * 50 + "\n")
    
    def add_task(self) -> None:
        """Handle add task command."""
        try:
            print("\n➕  ADD NEW TASK")
            print("─" * 30)
            description = input("📝 Enter task description: ").strip()
            if not description:
                print("❌  Error: Task description cannot be empty!")
                return
            
            task = self.service.create_task(description)
            print(f"\n✅  Success! Task created!")
            print(f"   🆔 ID: {task.id}")
            print(f"   📝 Description: {task.description}\n")
        except ValueError as e:
            print(f"\n❌  Error: {e}\n")
        except Exception as e:
            print(f"\n⚠️  Unexpected error: {e}\n")
    
    def list_tasks(self) -> None:
        """Handle list tasks command."""
        try:
            tasks = self.service.get_all_tasks()
            self.display_tasks(tasks)
        except Exception as e:
            print(f"\n❌  Error listing tasks: {e}\n")
    
    def mark_complete(self) -> None:
        """Handle mark task complete command."""
        try:
            print("\n✅  MARK TASK AS COMPLETE")
            print("─" * 30)
            task_id = input("🆔 Enter task ID: ").strip()
            if not task_id:
                print("❌  Error: Task ID cannot be empty!\n")
                return
            
            task = self.service.mark_complete(task_id)
            print(f"\n🎉  Awesome! Task marked as complete!")
            print(f"   ✅ '{task.description}'\n")
        except ValueError as e:
            print(f"\n❌  Error: {e}\n")
        except Exception as e:
            print(f"\n⚠️  Unexpected error: {e}\n")
    
    def update_task(self) -> None:
        """Handle update task command."""
        try:
            print("\n✏️  UPDATE TASK")
            print("─" * 30)
            task_id = input("🆔 Enter task ID: ").strip()
            if not task_id:
                print("❌  Error: Task ID cannot be empty!\n")
                return
            
            new_description = input("📝 Enter new description: ").strip()
            if not new_description:
                print("❌  Error: Task description cannot be empty!\n")
                return
            
            task = self.service.update_task(task_id, new_description)
            print(f"\n✨  Task updated successfully!")
            print(f"   📝 New description: {task.description}\n")
        except ValueError as e:
            print(f"\n❌  Error: {e}\n")
        except Exception as e:
            print(f"\n⚠️  Unexpected error: {e}\n")
    
    def delete_task(self) -> None:
        """Handle delete task command."""
        try:
            print("\n🗑️  DELETE TASK")
            print("─" * 30)
            task_id = input("🆔 Enter task ID: ").strip()
            if not task_id:
                print("❌  Error: Task ID cannot be empty!\n")
                return
            
            deleted = self.service.delete_task(task_id)
            if deleted:
                print(f"\n🗑️  Task deleted successfully!\n")
            else:
                print(f"\n❌  Error: Task with ID {task_id} not found.\n")
        except ValueError as e:
            print(f"\n❌  Error: {e}\n")
        except Exception as e:
            print(f"\n⚠️  Unexpected error: {e}\n")
    
    def run(self) -> None:
        """Run the CLI main loop."""
        print("\n" + "=" * 50)
        print("🌟  WELCOME TO TODO MANAGER! 🌟")
        print("=" * 50)
        print("✨  Stay organized and get things done! ✨\n")
        
        while True:
            self.display_menu()
            choice = input("👉  Enter your choice: ").strip()
            
            if choice == "1":
                self.add_task()
            elif choice == "2":
                self.list_tasks()
            elif choice == "3":
                self.mark_complete()
            elif choice == "4":
                self.update_task()
            elif choice == "5":
                self.delete_task()
            elif choice == "6":
                print("\n" + "=" * 50)
                print("👋  Thanks for using Todo Manager!")
                print("🌟  Have a productive day! 🌟")
                print("=" * 50 + "\n")
                sys.exit(0)
            else:
                print("\n⚠️  Invalid choice. Please enter a number between 1-6.\n")


def main():
    """Entry point for the CLI application."""
    cli = TodoCLI()
    cli.run()


if __name__ == "__main__":
    main()
