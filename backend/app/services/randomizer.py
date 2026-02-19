from app.models.randomizer import RandomizerRequest
import random
import os

class RandomizerService:
    def __init__(self, class_path: str):
        
        if not os.path.exists(class_path):
            raise FileNotFoundError(f"Classes file not found: {class_path}")
        
        with open(class_path, 'r') as f:
            self.class_names = [line.strip() for line in f if line.strip()]
        
        if not self.class_names:
            raise ValueError("No classes loaded from file")
        
        print(f"Loaded {len(self.class_names)} classes for randomizer")
    
    def get_random_classes(self, request: RandomizerRequest) -> list[str]:
        available_classes = self.class_names.copy()

        if request.exclude_classes:
            available_classes = [c for c in available_classes if c not in request.exclude_classes]

        if request.repetitions:
            # can repeat classes
            selected = [random.choice(available_classes) for _ in range(request.count)]
        else:
            # does not repeat classes
            sample_size = min(request.count, len(available_classes))
            selected = random.sample(available_classes, sample_size)
        
        return selected
    
    def get_class(self) -> str:
        return random.choice(self.class_names)
    
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
classes_file = os.path.join(BACKEND_DIR, 'data', 'classes.txt')

# This is the actual service you'll import
randomizer_service = RandomizerService(classes_file)