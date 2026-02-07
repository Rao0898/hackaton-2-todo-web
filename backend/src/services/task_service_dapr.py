from sqlmodel import Session
from ..models.models import Task, TaskCreate  
 
 def create_task(*, session: Session, task_create: TaskCreate) -> Task:
    """
    Create a new task with user_id filtering and publish event via Dapr
    """
    from uuid import UUID

    
    # Agar task_create mein nahi hai, toh hum models/schemas ke mutabiq handle karenge
    user_id_raw = getattr(task_create, 'user_id', None)
    
    if user_id_raw is None:
        # Agar schema mein user_id nahi hai, toh shayad ye current_user se aana chahiye
        # Filhal hum ek error raise karte hain taake aapko pata chale
        raise ValueError("TaskCreate object has no attribute 'user_id'. Check your schemas/task.py")

    # Handle user_id conversion safely
    if isinstance(user_id_raw, UUID):
        user_id_uuid = user_id_raw
    else:
        try:
            user_id_uuid = UUID(str(user_id_raw))
        except ValueError:
            raise ValueError(f"Invalid user_id format: {user_id_raw}")

    # Verify user exists
    user = session.get(User, user_id_uuid)
    if not user:
        raise ValueError(f"User with id {user_id_uuid} does not exist")

    # Create task data
    task_data = task_create.dict()
    task_data['user_id'] = user_id_uuid

    db_task = Task.model_validate(task_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Dapr publication logic (same as before)
    if DAPR_AVAILABLE:
        task_event_data = {
            'id': str(db_task.id),
            'action': 'task_created',
            'timestamp': datetime.now().isoformat(),
            'task_data': {
                'id': str(db_task.id),
                'title': db_task.title,
                'user_id': str(db_task.user_id)
            }
        }
        import threading
        thread = threading.Thread(target=lambda: asyncio.run(publish_task_event(task_event_data)))
        thread.start()

    return db_task